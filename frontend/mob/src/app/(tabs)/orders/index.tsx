import { testApi } from '@/lib/apiRequest';
import { Order, OrderStatus } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'


import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_CONFIG: Record<OrderStatus, { label: string, color: string, bg: string, icon: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", icon: "time-outline" },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", icon: "checkmark-circle-outline" },
  PREPARING: { label: "Preparing", color: "text-orange-600", bg: "bg-orange-50", icon: "restaurant-outline" },
  ASSIGNED: { label: "Assigned", color: "text-purple-600", bg: "bg-purple-50", icon: "person-outline" },
  OUT_FOR_DELIVERY: { label: "Out For Delivery", color: "text-blue-600", bg: "bg-blue-50", icon: "bicycle-outline" },
  DELIVERED: { label: "Delivered", color: "text-green-600", bg: "bg-green-50", icon: "checkmark-done-circle-outline" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: "close-circle-outline" },
}

export default function orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchOrders() {
    try {
      const res = await testApi('/orders/my')
      setOrders(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  function onRefresh() {
    setRefreshing(true)
    fetchOrders();
    setRefreshing(false)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white mx-3 px-5 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold">My Orders</Text>
        <Text>Track your fresh deliveries</Text>
      </View>

      {
        isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) :
          orders.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 bg-white">
              <View className="size-24 bg-gray-100 rounded-full items-center justify-center mb-5">
                <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
              </View>

              <Text className="text-gray-900 text-xl font-bold">No Orders Yet</Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Your order history will appear here
              </Text>

              <TouchableOpacity
                className="bg-green-600 mt-6 px-8 h-12 rounded-2xl items-center justify-center"
                activeOpacity={0.8}
                onPress={() => router.navigate("/(tabs)")}
              >
                <Text className="text-white text-sm font-semibold">Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
              contentContainerStyle={{ padding: 20, gap: 12 }}
            >
              {
                orders.map((order) => {
                  const status = STATUS_CONFIG[order.status]
                  return (
                    <TouchableOpacity
                      key={order.id}
                      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
                      onPress={() => router.push(`/(tabs)/orders/${order.id}`)}
                      activeOpacity={0.9}
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-900 text-sm font-bold">{order.orderNumber}</Text>
                        <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}>
                          <Ionicons name={status.icon as any} size={14} color={status.color} />
                          <Text className={`text-xs font-semibold`}>{status.label}</Text>
                        </View>
                      </View>

                      <Text className="text-gray-500 text-xs mb-3" numberOfLines={1}>
                        {order.items.map((i) => `${i.product.name} x ${i.quantity}`).join(', ')}
                      </Text>
                      <View className="h-px bg-gray-300 mb-3" />

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="location-outline" size={14} color="#9ca3af" />
                          <Text>{order.address.city}</Text>
                        </View>
                        <Text className="text-green-600 text-base font-bold">Rs {order.total}</Text>
                      </View>

                      <View className="flex-row items-center justify-between mt-2">
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                          <Text className="text-gray-400 text-xs">
                            {
                              new Date(order.createdAt).toLocaleDateString("en-GB", {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            }
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Text className="text-gray-400 text-xs">View details</Text>
                          <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
                        </View>
                      </View>

                    </TouchableOpacity>
                  )
                })
              }
            </ScrollView>
          )
      }
    </SafeAreaView>
  )
}