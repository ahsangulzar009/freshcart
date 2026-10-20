import { View, Text, TouchableOpacity, Alert, ScrollView, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cartStore';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const FREE_DELIVERY_ABOVE = 500;

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const incrementQuantity = useCartStore((s) => s.incrementQuantity);
  const decrementQuantity = useCartStore((s) => s.decrementQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = useCartStore((s) => s.getSubtotal());
  const total = useCartStore((s) => s.getTotal());
  const deliveryFee = useCartStore((s) => s.getDeliveryFee());
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const remainingForFree = Math.max(0, FREE_DELIVERY_ABOVE - subtotal);
  const hasFreeDelivery = subtotal >= FREE_DELIVERY_ABOVE;


  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http')
      ? imageUrl
      : `${process.env.EXPO_PUBLIC_API_URL}${imageUrl}`;
  };

  function confirmClear() {
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  }


  function renderItem({ item }: { item: (typeof items)[number] }) {
    const imageUrl = getImageUrl(item.product.imageUrl);

    return (
      <View className="bg-white rounded-3xl overflow-hidden border border-gray-100">
        <View className="flex-row items-center p-4 gap-4">
          <View className="size-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <Image
                className="size-full"
                style={{ resizeMode: 'cover' }}
                source={{ uri: imageUrl }}
              />
            ) : (
              <View>
                <Ionicons name="image-outline" size={28} color="#d1d5db" />
              </View>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-gray-900 text-sm font-bold" numberOfLines={1}>
                  {item.product.name}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <View className="bg-gray-100 py-0.5 px-2 rounded-xl">
                    <Text className="text-gray-500 text-xs">{item.product.category}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs">• per {item.product.unit}</Text>
                </View>
              </View>
              <TouchableOpacity
                className="size-7 bg-red-50 rounded-full items-center justify-center"
                onPress={() =>
                  Alert.alert('Remove Item', `Remove "${item.product.name}" from cart?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => removeItem(item.product.id),
                    },
                  ])
                }
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between mt-3">
              <View>
                <Text className="text-gray-600 text-xs">
                  Rs {item.product.price} x {item.quantity}
                </Text>
                <Text className="text-green-600 text-base font-bold">
                  Rs {(Number(item.product.price) * item.quantity).toFixed(0)}
                </Text>
              </View>

              <View className="flex-row items-center gap-3 bg-gray-50 p-1">
                <TouchableOpacity
                  className="size-10 bg-white rounded-xl items-center justify-center shadow-sm border border-gray-50"
                  onPress={() => decrementQuantity(item.product.id)}
                >
                  <Ionicons name="remove" size={16} color="#16a34a" />
                </TouchableOpacity>
                <Text className="text-gray-900 text-sm font-bold w-6 text-center">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  className="p-3 bg-green-600 rounded-xl items-center justify-center"
                  onPress={() => incrementQuantity(item.product.id)}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ---------------- Empty cart ----------------
  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
          <TouchableOpacity
            className="size-10 rounded-full bg-gray-100 items-center justify-center mr-3"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-xl font-bold">My Cart</Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="size-24 bg-gray-100 rounded-full items-center justify-center mb-5">
            <Ionicons name="cart-outline" size={48} color="#d1d5db" />
          </View>
          <Text className="text-gray-900 text-xl font-bold">Cart is empty</Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Add some fresh products to get started
          </Text>

          <TouchableOpacity
            className="bg-green-600 mt-6 px-8 h-12 rounded-2xl items-center justify-center"
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="text-white text-sm font-semibold">Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function renderFooter() {
    return (
      <View className="flex-1">
        <View className="mt-4 bg-white rounded-3xl p-4 border border-gray-100">
          {hasFreeDelivery ? (
            <View className="flex-row items-center gap-3">
              <View className="size-10 bg-gray-50 rounded-full items-center justify-center">
                <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
              </View>
              <View>
                <Text className="text-green-600 text-sm font-bold">Free Delivery unlocked!</Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  You order qualifies for free delivery
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-center mb-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="bicycle-outline" size={18} color="#3b82f6" />
                  <Text className="text-gray-700 text-sm font-semibold">
                    Add Rs {remainingForFree.toFixed(0)} more for free delivery
                  </Text>
                  <Text className="text-gray-400 text-xs">Rs {FREE_DELIVERY_ABOVE}</Text>
                </View>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min((subtotal / FREE_DELIVERY_ABOVE) * 100, 100)}%` }}
                />
              </View>
            </View>
          )}
        </View>

        <View className="mt-4 bg-white rounded-3xl p-5 border border-gray-100 mb-36">
          <Text className="text-gray-900 text-base font-bold mb-4">Bill Summary</Text>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row justify-between items-center gap-2">
                <Ionicons name="bag-outline" size={16} color="#9ca3af" />
                <Text className="text-gray-500 text-sm">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</Text>
              </View>
              <Text className="text-gray-900 text-sm">Rs {subtotal.toFixed(0)}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row justify-between items-center gap-2">
                <Ionicons name="bicycle-outline" size={16} color="#9ca3af" />
                <Text className="text-gray-500 text-sm">Delivery Fee</Text>
              </View>
              <Text className={`text-sm font-medium ${hasFreeDelivery ? 'text-green-600' : 'text-gray-900'}`}>{hasFreeDelivery ? "FREE" : `Rs ${deliveryFee}`}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Ionicons name="shield-checkmark-outline" size={16} color="#9ca3af" />
                <Text className="text-gray-500 text-sm">Platform Fee</Text>
              </View>
              <Text className="text-green-600 text-sm font-medium">Free</Text>
            </View>
            <View className="h-px bg-gray-100" />

            <View className="flex-row justify-between items-center ">
              <Text className="text-gray-900 items-center">Total</Text>
              <Text className="text-green-600 text-lg font-bold">Rs {total.toFixed(0)}</Text>
            </View>
          </View>

          {
            hasFreeDelivery && (
              <View className="mt-3 bg-green-50 rounded-2xl px-4 py-2.5 flex-row items-center gap-2">
                <Ionicons name="gift-outline" size={16} className="#16a34a" />
                <Text className="text-green-700 text-xs font-semibold">You Saved Rs40 on delivery</Text>
              </View>
            )
          }
        </View>
      </View>
    )
  }

  // ---------------- Cart with items ----------------
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="size-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View>
            <Text className="text-gray-900 text-xl font-bold">My Cart</Text>
            <Text className="text-gray-400 text-xs">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-xl"
          onPress={confirmClear}
        >
          <Ionicons name="trash-outline" size={14} color="#ef4444" />
          <Text className="text-red-500 text-xs font-semibold">Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      />

      <View className="absolute bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 pb-6">
        <TouchableOpacity
          activeOpacity={0.85}
          className="bg-green-600 h-14 rounded-2xl items-center justify-center flex-row gap-2"
          onPress={() => router.push('/checkout')}
        >
          <Ionicons name="bag-check-outline" size={20} color="white" />
          <Text className="text-white text-base font-semibold">Proceed to checkout</Text>
          <Text className="text-green-200 text-base font-semibold">• Rs {total.toFixed(0)}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}


{/* Bottom summary + checkout
      <View className="bg-white border-t border-gray-100 px-5 pt-4 pb-5 rounded-t-3xl">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-500 text-sm">Subtotal</Text>
          <Text className="text-gray-900 text-sm font-semibold">
            RS {subtotal.toFixed(0)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-500 text-sm">Delivery fee</Text>
          {deliveryFee === 0 ? (
            <Text className="text-green-600 text-sm font-semibold">Free</Text>
          ) : (
            <Text className="text-gray-900 text-sm font-semibold">
              RS {deliveryFee.toFixed(0)}
            </Text>
          )}
        </View>

        <View className="h-px bg-gray-100 my-2" />

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-base font-bold">Total</Text>
          <Text className="text-green-600 text-xl font-bold">
            RS {total.toFixed(0)}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-green-600 h-14 rounded-2xl flex-row items-center justify-center gap-2"
          activeOpacity={0.9}
          onPress={handleCheckout}
        >
          <Text className="text-white text-base font-bold">Place Order</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      </View> */}