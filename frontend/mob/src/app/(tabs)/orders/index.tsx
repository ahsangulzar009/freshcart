import { useGetMyOrders } from '@/features/order';
import type { GetMyOrdersSuccessRes } from '@/features/order';
import { OrderStatus } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View,Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrderItem = GetMyOrdersSuccessRes['orders'][number];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", icon: "time-outline" },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", icon: "checkmark-circle-outline" },
  PREPARING: { label: "Preparing", color: "text-orange-600", bg: "bg-orange-50", icon: "restaurant-outline" },
  ASSIGNED: { label: "Assigned", color: "text-purple-600", bg: "bg-purple-50", icon: "person-outline" },
  OUT_FOR_DELIVERY: { label: "Out For Delivery", color: "text-blue-600", bg: "bg-blue-50", icon: "bicycle-outline" },
  DELIVERED: { label: "Delivered", color: "text-green-600", bg: "bg-green-50", icon: "checkmark-done-circle-outline" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: "close-circle-outline" },
};


export default function Orders() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching
  } = useGetMyOrders({ page, limit: 10 });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const renderOrder = ({ item: order }: { item: OrderItem }) => {
    const status = STATUS_CONFIG[order.status];
    return (
      <TouchableOpacity
        className="mx-5 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        onPress={() => router.push(`/(tabs)/orders/${order.id}`)}
        activeOpacity={0.9}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-900 text-sm font-bold">{order.orderNumber}</Text>
          <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}>
            <Ionicons name={status.icon as any} size={14} color="#6b7280" />
            <Text className={`text-xs font-semibold ${status.color}`}>{status.label}</Text>
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
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-gray-400 text-xs">View details</Text>
            <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="items-center justify-center px-6 pt-24">
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
  );

  const renderFooter = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
      <View className="mx-5 mt-4 flex-row items-center justify-between">
        <TouchableOpacity
          disabled={!pagination.hasPrev}
          onPress={() => setPage((p) => p - 1)}
          className={`px-5 h-10 rounded-2xl items-center justify-center ${pagination.hasPrev ? 'bg-green-600' : 'bg-gray-200'
            }`}
        >
          <Text className="text-white text-sm font-semibold">Prev</Text>
        </TouchableOpacity>

        <Text className="text-gray-500 text-xs">
          Page {pagination.page} of {pagination.totalPages}
        </Text>

        <TouchableOpacity
          disabled={!pagination.hasNext}
          onPress={() => setPage((p) => p + 1)}
          className={`px-5 h-10 rounded-2xl items-center justify-center ${pagination.hasNext ? 'bg-green-600' : 'bg-gray-200'
            }`}
        >
          <Text className="text-white text-sm font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white mx-3 px-5 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold">My Orders</Text>
        <Text>Track your fresh deliveries</Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-900 text-base font-bold">Something went wrong</Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">{error.message}</Text>
          <TouchableOpacity
            className="bg-green-600 mt-6 px-8 h-12 rounded-2xl items-center justify-center"
            onPress={() => refetch()}
          >
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingVertical: 20, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#16a34a']}
              tintColor="#16a34a"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}