import { testApi } from '@/lib/apiRequest';
import { Order, OrderStatus } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_STEPS: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PREPARING", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"
]

const STATUS_CONFIG: Record<OrderStatus, { label: string, color: string, bg: string, icon: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", icon: "time-outline" },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", icon: "checkmark-circle-outline" },
  PREPARING: { label: "Preparing", color: "text-orange-600", bg: "bg-orange-50", icon: "restaurant-outline" },
  ASSIGNED: { label: "Assigned", color: "text-purple-600", bg: "bg-purple-50", icon: "person-outline" },
  OUT_FOR_DELIVERY: { label: "Out For Delivery", color: "text-blue-600", bg: "bg-blue-50", icon: "bicycle-outline" },
  DELIVERED: { label: "Delivered", color: "text-green-600", bg: "bg-green-50", icon: "checkmark-done-circle-outline" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: "close-circle-outline" },
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await testApi(`/orders/${id}`)
        setOrder(res.data)
      } catch (error) {
        router.back()
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (isLoading || !order) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    )
  }

  const currentIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED'

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-5 pt-6 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          className="size-10 rounded-full bg-gray-100 items-center justify-center mr-3"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-bold">{order.orderNumber}</Text>
          <Text className="text-gray-400 text-xs">
            {
              new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            }
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {
          !isCancelled ? (
            <View>
              <Text>Order Status</Text>
            </View>
          ) : (
            <View className="mx-5 mt-5 bg-red-50 rounded-3xl p-5 border border-red-100 flex-row items-center gap-3">
              <Ionicons name="close-circle" size={28} color="#ef4444" />
              <View>
                <Text>Order Cancelled</Text>
                {
                  order?.notes && (
                    <Text className="text-red-400 text-xs mt-0.5">{order.notes}</Text>
                  )
                }
              </View>
            </View>
          )
        }

        <View className="mx-5 mt-4 rounded-3xl p-5 border border-gray-100">
          <Text className="text-gray-900 text-base font-bold mb-3">Delivery Address</Text>
          <View className="flex-row items-center gap-3">
            <View className="size-9 bg-green-50 rounded-2xl items-center justify-center">
              <Ionicons name="location" size={18} color="#16a34a" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}