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

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
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
          <Text className="text-gray-400 text-sm">
            {new Date(order.createdAt).toLocaleString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {
          !isCancelled ? (
            <View className="mx-5 mt-5 bg-white rounded-3xl p-5 border border-gray-100">
              <Text className="text-gray-900 text-base font-bold mb-5">Order Status</Text>
              {
                STATUS_STEPS.map((step, index) => {
                  const config = STATUS_CONFIG[step];
                  const isDone = index <= currentStepIndex;
                  const isActive = index === currentStepIndex

                  return (
                    <View className="flex-row gap-4" key={step}>
                      <View className="items-center">
                        <View className={`size-9 rounded-full items-center justify-center ${isDone ? 'bg-green-600' : 'bg-gray-100'}`}>
                          <Ionicons
                            name={config.icon as any}
                            size={16}
                            color={isDone ? 'white' : '#d1d5db'}
                          />
                        </View>
                        {
                          index < STATUS_STEPS.length - 1 && (
                            <View
                              className={`w-0.5 h-8 mt-1 ${isDone && index < currentStepIndex
                                ? 'bg-green-600'
                                : 'bg-gray-100'
                                }`}
                            />
                          )
                        }
                      </View>
                      <View className="flex-1 pb-8">
                        <Text className={`text-sm font-semibold ${isActive ? 'text-green-600' : isDone ? 'text-gray-900' : 'text-gray-300'}`}>
                          {config.label}
                        </Text>
                        {
                          isActive && (
                            <Text className="text-gray-400 text-xs mt-0.5">Current Status</Text>
                          )
                        }
                      </View>
                    </View>
                  )
                })
              }
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
            <View>
              <Text className="text-gray-900 text-sm font-semibold">{order?.address?.label}</Text>
              <Text className="text-gray-500 text-xs mt-0.5">{order?.address?.line1} {order.address.line2 && `, ${order.address.line2}`}
              </Text>
              <Text>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </Text>
            </View>
          </View>
        </View>

        <View className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-gray-100">
          <Text className="text-gray-900 text-base font-bold mb-3">Items Ordered</Text>
          <View>
            {
              order.items.map((item) => (
                <View key={item.id} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="size-9 bg-gray-100 rounded-xl items-center justify-center">
                      <Ionicons name="bag-outline" size={16} color="#9ca3af" />
                    </View>
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-gray-900 text-sm font-medium">
                        {item.product.name}
                      </Text>
                      <Text className="text-gray-400 text-xs">{item.unitPrice} x {item.quantity}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-900 text-sm font-semibold">Rs {item.total}</Text>
                </View>
              ))
            }
          </View>
        </View>

        <View className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-gray-100 mb-8">
          <Text className="text-gray-900 text-base font-bold mb-3">Bill Summary</Text>
          <View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm">Subtotal</Text>
              <Text className="text-gray-900 text-sm font-medium">Rs {order.subtotal}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm">Delivery Fee</Text>
              <Text
                className={`text-sm font-medium ${Number(order.deliveryFee) === 0 ? 'text-green-600' : 'text-gray-900'}`}
              >
                {Number(order.deliveryFee) === 0 ? 'FREE' : `Rs ${order.deliveryFee}`}
              </Text>
            </View>
            <View className="h-px bg-gray-100 my-1" />
            <View className="flex-row justify-between">
              <Text className="text-gray-900 text-base font-bold">Total</Text>
              <Text className="text-green-600 text-base font-bold">Rs {order.total}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm">Payment</Text>
              <Text className="text-gray-900 text-base">{order.paymentMethod}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}