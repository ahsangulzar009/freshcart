import { useGetOrderById } from '@/features/order';
import { BASE_URL } from '@/lib/apiRequest';
import { OrderStatus } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_STEPS: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PREPARING", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED",
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", icon: "time-outline" },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", icon: "checkmark-circle-outline" },
  PREPARING: { label: "Preparing", color: "text-orange-600", bg: "bg-orange-50", icon: "restaurant-outline" },
  ASSIGNED: { label: "Assigned", color: "text-purple-600", bg: "bg-purple-50", icon: "person-outline" },
  OUT_FOR_DELIVERY: { label: "Out For Delivery", color: "text-blue-600", bg: "bg-blue-50", icon: "bicycle-outline" },
  DELIVERED: { label: "Delivered", color: "text-green-600", bg: "bg-green-50", icon: "checkmark-done-circle-outline" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: "close-circle-outline" },
};

const PAYMENT_METHOD_LABEL = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
} as const;

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  PAID: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50' },
  FAILED: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-50' },
  REFUNDED: { label: 'Refunded', color: 'text-blue-700', bg: 'bg-blue-50' },
} as const;

const getImageUri = (imageUri: string | null) => {
  if (!imageUri) return null;
  return imageUri.startsWith('http') ? imageUri : `${BASE_URL}${imageUri}`;
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isPending, isError, error, refetch, isRefetching } = useGetOrderById(id);
  const order = data?.order;

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-900 text-base font-bold mt-3">Could not load order</Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          {error?.message ?? 'Order not found'}
        </Text>
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            className="bg-gray-100 px-6 h-12 rounded-2xl items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-gray-700 text-sm font-semibold">Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-600 px-6 h-12 rounded-2xl items-center justify-center"
            onPress={() => refetch()}
          >
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const statusTime = new Map(order.statusHistory.map((h) => [h.status, h.createdAt]));

  const renderHeader = () => (
    <>
      {!isCancelled ? (
        <View className="mx-5 mt-5 bg-white rounded-3xl p-5 border border-gray-100">
          <Text className="text-gray-900 text-base font-bold mb-5">Order Status</Text>
          {STATUS_STEPS.map((step, index) => {
            const config = STATUS_CONFIG[step];
            const isDone = index <= currentStepIndex;
            const isActive = index === currentStepIndex;
            const time = statusTime.get(step);

            return (
              <View className="flex-row gap-4" key={step}>
                <View className="items-center">
                  <View
                    className={`size-9 rounded-full items-center justify-center ${isDone ? 'bg-green-600' : 'bg-gray-100'
                      }`}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={16}
                      color={isDone ? 'white' : '#d1d5db'}
                    />
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      className={`w-0.5 h-8 mt-1 ${isDone && index < currentStepIndex ? 'bg-green-600' : 'bg-gray-100'
                        }`}
                    />
                  )}
                </View>
                <View className="flex-1 pb-8">
                  <Text
                    className={`text-sm font-semibold ${isActive ? 'text-green-600' : isDone ? 'text-gray-900' : 'text-gray-300'
                      }`}
                  >
                    {config.label}
                  </Text>
                  {isActive && (
                    <Text className="text-gray-400 text-xs mt-0.5">Current Status</Text>
                  )}
                  {time && isDone && (
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {new Date(time).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="mx-5 mt-5 bg-red-50 rounded-3xl p-5 border border-red-100 flex-row items-center gap-3">
          <Ionicons name="close-circle" size={28} color="#ef4444" />
          <View className="flex-1">
            <Text className="text-red-600 text-sm font-bold">Order Cancelled</Text>
            {order.cancelReason && (
              <Text className="text-red-400 text-xs mt-0.5">{order.cancelReason}</Text>
            )}
          </View>
        </View>
      )}

      <View className="mx-5 mt-4 bg-white rounded-3xl p-5 border border-gray-100">
        <Text className="text-gray-900 text-base font-bold mb-3">Delivery Address</Text>
        <View className="flex-row items-center gap-3">
          <View className="size-9 bg-green-50 rounded-2xl items-center justify-center">
            <Ionicons name="location" size={18} color="#16a34a" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold">{order.address.label}</Text>
            <Text className="text-gray-500 text-xs mt-0.5">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ''}
            </Text>
            <Text className="text-gray-500 text-xs">
              {order.address.city}, {order.address.state}
            </Text>
          </View>
        </View>
      </View>

      <Text className="mx-5 mt-4 mb-3 text-gray-900 text-base font-bold">Items Ordered</Text>
    </>
  );

  const renderFooter = () => (
    <View className="mx-5 mt-4 mb-8 bg-white rounded-3xl p-5 border border-gray-100 gap-2">
      <Text className="text-gray-900 text-base font-bold mb-1">Bill Summary</Text>
      <View className="flex-row justify-between">
        <Text className="text-gray-500 text-sm">Subtotal</Text>
        <Text className="text-gray-900 text-sm font-medium">Rs {order.subtotal}</Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-500 text-sm">Delivery Fee</Text>
        <Text
          className={`text-sm font-medium ${Number(order.deliveryFee) === 0 ? 'text-green-600' : 'text-gray-900'
            }`}
        >
          {Number(order.deliveryFee) === 0 ? 'FREE' : `Rs ${order.deliveryFee}`}
        </Text>
      </View>
      {Number(order.discount) > 0 && (
        <View className="flex-row justify-between">
          <Text className="text-gray-500 text-sm">Discount</Text>
          <Text className="text-green-600 text-sm font-medium">- Rs {order.discount}</Text>
        </View>
      )}
      <View className="h-px bg-gray-100 my-1" />
      <View className="flex-row justify-between">
        <Text className="text-gray-900 text-base font-bold">Total</Text>
        <Text className="text-green-600 text-base font-bold">Rs {order.total}</Text>
      </View>
      <View className="flex-row justify-between items-start">
        <Text className="text-gray-500 text-sm">Payment Method</Text>
        <View className="items-end">
          <Text className="text-gray-900 text-sm font-medium">
            COD ({PAYMENT_METHOD_LABEL[order.paymentMethod]})
          </Text>
          <Text className={`text-xs font-semibold mt-0.5 ${PAYMENT_STATUS_CONFIG[order.paymentStatus].color}`}>
            Payment ({order.paymentStatus})
          </Text>
        </View>
      </View>

    </View>
  );

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
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-900 text-lg font-bold">Order Number: </Text>
            <Text className="text-green-600 text-md font-semibold">{order.orderNumber}</Text>
          </View>
          <Text className="text-gray-400 text-sm mt-2">
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

      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
        renderItem={({ item }) => {
          const uri = getImageUri(item.product.imageUrl);
          return (
            <View className="mx-5 bg-white rounded-3xl p-4 border border-gray-100 flex-row items-center gap-3">
              <View className="size-14 bg-gray-100 rounded-2xl overflow-hidden">
                {uri ? (
                  <Image source={{ uri }} style={{ resizeMode: 'cover' }} className="w-full h-full" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="image-outline" size={20} color="#d1d5db" />
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-gray-900 text-sm font-medium">
                  {item.product.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  Rs {item.unitPrice} / {item.product.unit} x {item.quantity}
                </Text>
              </View>
              <Text className="text-gray-900 text-sm font-semibold">Rs {item.total}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}