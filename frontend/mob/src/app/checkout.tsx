import { BASE_URL } from '@/lib/apiRequest';
import { useCartStore } from '@/store/cartStore';
import { Address } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

const CheckoutScreen = () => {
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectdAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacing, seIsPlacing] = useState(false);

  const subTotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const getImageUri = (imageUri: string | null) => {
    if (!imageUri) return null;
    return imageUri.startsWith('http') ? imageUri : `${BASE_URL}${imageUri}`
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-16 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="size-10 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-gray-900 text-xl font-bold">Checkout</Text>
            <Text className="text-gray-400 text-xs">{items.length} items • {total.toFixed(0)}</Text>
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

        <View className="mx-5 mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-base font-bold">Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push('/add-address')}>
              <Text className="text-green-600 text-sm font-medium">+ Add New</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  )
}

export default CheckoutScreen