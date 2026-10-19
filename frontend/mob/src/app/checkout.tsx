import { BASE_URL, testApi } from '@/lib/apiRequest';
import { useCartStore } from '@/store/cartStore';
import { Address } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const CheckoutScreen = () => {
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectdAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);

  const subTotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const getImageUri = (imageUri: string | null) => {
    if (!imageUri) return null;
    return imageUri.startsWith('http') ? imageUri : `${BASE_URL}${imageUri}`
  }

  async function fetchAddresses() {
    try {
      const res = await testApi("/address")
      setAddresses(res.data)
      const defaultAddr = res.data.find((a: Address) => a.isDefault) || res.data[0]
      if (defaultAddr) setSelectedAddress(defaultAddr)
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAddresses() }, [])

  async function handlePlaceOrder() {
    if (!selectdAddress) {
      Alert.alert("Error", "Please select a delivery address")
      return;
    }

    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty")
      return;
    }

    setIsPlacing(true)
    try {
      await testApi('/orders', {
        method: "POST",
        body: JSON.stringify({
          addressId: selectdAddress.id,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity
          }))
        })
      })
      clearCart()
      Toast.show({ type: "success", text1: "Your order has been placed successfully!" })
      setTimeout(() => {
        Alert.alert("Order Placed!", "Your order has been placed successfully!", [
          { text: "View Orders", onPress: () => router.push('/(tabs)/orders') }
        ])
      }, 1500)
    } catch (error) {
      Alert.alert("Error", (error as Error).message)
    } finally {
      setIsPlacing(false)
    }

  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-6 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="size-10 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-gray-900 text-xl font-bold">Checkout</Text>
            <Text className="text-gray-400 text-xs">{items.length} items • Rs {total.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="mx-5 mt-5">
          <Text className="text-gray-900 text-base font-bold mb-3">Order Items</Text>
          <View className="bg-white rounded-3xl p-4 border border-gray-100">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {
                  items?.map((item) => (
                    <View key={item.product.id} className="items-center gap-1.5">
                      <View className="size-16 bg-gray-100 rounded-2xl overflow-hidden">
                        {
                          getImageUri(item.product.imageUrl) ? (
                            <Image source={{ uri: getImageUri(item.product.imageUrl)! }} style={{ resizeMode: 'cover' }} className="w-full h-full" />
                          ) : (
                            <View className="flex-1 items-center justify-center">
                              <Ionicons name="image-outline" size={24} color="#d1b5db" />
                            </View>
                          )
                        }
                      </View>
                      <Text numberOfLines={1} style={{ maxWidth: 64 }} className="text-gray-700 text-xs font-medium text-center">{item.product.name}</Text>
                      <View className="bg-green-50 px-2 py-0.5 rounded-full">
                        <Text className="text-green-600 text-sm font-bold">{item.quantity}</Text>
                      </View>
                    </View>
                  ))
                }
              </View>
            </ScrollView>

            <View className="mt-4 pt-3 border-t border-gray-100 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Subtotal</Text>
                <Text className="text-gray-900 text-sm font-medium">{subTotal.toFixed(0)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Delivery Fee</Text>
                <Text className="text-gray-500 text-sm">
                  {deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee}`}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Platfom Fee</Text>
                <Text className="text-green-600 text-sm font-medium">Free</Text>
              </View>
              <View className="h-px bg-gray-100" />
              <View className="flex-row justify-between">
                <Text className="text-gray-900 text-base font-bold">Total</Text>
                <Text className="text-gray-600 text-base font-bold">Rs {total.toFixed(0)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mx-7 mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-base font-bold">Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push('/add-address')}>
              <Text className="text-green-600 text-sm font-medium">+ Add New</Text>
            </TouchableOpacity>
          </View>

          {
            addresses.length === 0 ? (
              <TouchableOpacity onPress={() => router.push('/add-address')} className="bg-white rounded-3xl p-5 border-2 border-dashed border-green-300 items-center gap-2">
                <View className="size-12 bg-gray-50 rounded-full items-center justify-center">
                  <Ionicons name="add-circle-outline" size={28} color="#16a34a" />
                </View>
                <Text className="text-green-600 text-sm font-medium">Add Delivery Address</Text>
                <Text className="text-gray-400 text-xs">Tab to add your delivery location</Text>
              </TouchableOpacity>
            ) : (
              <View>
                {
                  addresses?.map((address) => (
                    <TouchableOpacity
                      key={address.id}
                      className={`bg-white rounded-3xl p-4 border-2 flex-row items-start gap-3 ${selectdAddress?.id === address.id ? 'border-green-600' : 'border-gray-100'
                        }`}
                      onPress={() => setSelectedAddress(address)}
                    >
                      <View className={`size-10 rounded-2xl items-center justify-center flex-shrink-0 ${selectdAddress?.id === address.id ? 'bg-green-600' : 'border-gray-100'
                        }`}>
                        <Ionicons
                          name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'location-outline'}
                          size={18}
                          color={selectdAddress?.id === address.id ? 'white' : '#9ca3af'}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-gray-900 text-sm font-bold">{address.label}</Text>
                          {
                            address.isDefault && (
                              <View>
                                <Text className="text-green-600 text-sm font-medium">Default</Text>
                              </View>
                            )
                          }
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">{address.line1}{address.line2 && ` ,${address.line2}`}</Text>
                        <Text className="text-gray-400 text-sm">
                          {address.city}, {address.state} - {address.pincode}
                        </Text>
                      </View>
                      <View className={`size-5 rounded-full border-2 items-center justify-center ${selectdAddress?.id === address.id ? 'border-green-600 bg-green-600' : 'border-gray-300'
                        }`}>
                        {
                          selectdAddress?.id === address.id && (
                            <Ionicons name="checkmark" size={12} color="white" />
                          )
                        }
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </View>
            )
          }
        </View>

        <View className="mx-5 mt-5">
          <Text className="text-gray-900 text-base font-bold mb-3">Payment Method</Text>
          <View>
            {
              [
                { id: "COD", label: "Cash on Delivery", sub: "Pay cash when your order arrives", icon: 'cash-outline' },
                { id: "ONLINE", label: "Online Payment", sub: "Debit/Credit Card, Net Banking", icon: 'card-outline' }
              ].map((method) => (
                <TouchableOpacity
                  onPress={() => setPaymentMethod(method.id as "COD" | "ONLINE")}
                  key={method.id}
                  className={`bg-white rounded-3xl p-4 flex-row border-2 items-center gap-3 ${paymentMethod === method.id ? "border-green-600" : "border-gray-100"}`}
                >
                  <View
                    className={`size-12 rounded-2xl items-center justify-center ${paymentMethod === method.id ? "bg-green-600" : "bg-gray-100"}`}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={18}
                      color={paymentMethod === method.id ? 'white' : '#9ca3af'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-sm font-bold">{method.label}</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">{method.sub}</Text>
                  </View>
                  <View className={`size-5 rounded-full border-2 items-center justify-center ${paymentMethod === method.id ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                    {
                      paymentMethod === method.id && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )
                    }
                  </View>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>

        <View className="mx-5 mt-5 mb-36 bg-white rounded-3xl p-4 border border-gray-100">
          <View className="flex-row items-center gap-3">
            <View className="size-10 bg-green-50 rounded-2xl items-center justify-center">
              <Ionicons name="time-outline" size={20} color="#16a34a" />
            </View>
            <View>
              <Text className="text-gray-900 text-sm font-bold">Estimated Delivery</Text>
              <Text className="text-gray-400 text-xs m-t0.5">30 - 60 minutes after confirmation</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 pb-8">
        <TouchableOpacity
          className={`h-14 rounded-2xl items-center justify-center flex-row gap-2 ${isPlacing ? 'bg-green-400' : 'bg-green-600'}`}
          disabled={isPlacing}
          activeOpacity={0.85}
          onPress={handlePlaceOrder}
        >
          {
            isPlacing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="bag-check-outline" size={20} color="white" />
                <Text className="text-white text-base font-semibold">Place Order</Text>
                <Text className="text-green-200 text-base font-bold">{total.toFixed(0)}</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

export default CheckoutScreen