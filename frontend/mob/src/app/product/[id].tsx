import { useGetProductById } from '@/features/products';
import { BASE_URL } from '@/lib/apiRequest';
import { useCartStore } from '@/store/cartStore';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const CATEGORY_CONFIG = {
  FRUITS: { label: 'Fruits', icon: 'nutrition' as const, color: '#16a34a', bg: 'bg-green-50', text: 'text-green-600' },
  VEGETABLES: { label: 'Vegetables', icon: 'leaf' as const, color: '#16a34a', bg: 'bg-green-50', text: 'text-green-600' },
  MEAT: { label: 'Meat', icon: 'restaurant' as const, color: '#dc2626', bg: 'bg-red-50', text: 'text-red-600' },
};

const getImageUri = (imageUrl: string | null) => {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isPending, isError, error, refetch, isRefetching } = useGetProductById(id);
  const product = data?.product;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const productId = product?.id ?? id;
  const qty = cartItems.find((i) => i.product.id === productId)?.quantity ?? 0;

  const category = product ? CATEGORY_CONFIG[product.category] : null;
  const imageUri = getImageUri(product?.imageUrl ?? null);
  const inStock = (product?.stock ?? 0) > 0;
  const price = Number(product?.price ?? 0);

  const handleAddToCart = () => {
    if (!product) return;
    if (!inStock) {
      Toast.show({ type: 'error', text1: 'This product is out of stock' });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price,
      unit: product.unit,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
    Toast.show({ type: 'success', text1: 'Added to cart', text2: product.name });
  };

  const handleIncrement = () => {
    if (!product || !inStock) return;

    if (qty === 0) {
      handleAddToCart();
      return;
    }

    if (qty >= product.stock) {
      Toast.show({ type: 'error', text1: 'Maximum available stock reached' });
      return;
    }

    incrementQuantity(product.id);
  };

  const handleDecrement = () => {
    if (!product || qty === 0) return;

    const removing = qty === 1;
    decrementQuantity(product.id);

    if (removing) {
      Toast.show({ type: 'info', text1: 'Removed from cart', text2: product.name });
    }
  };


  if (isPending) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-400 text-sm mt-3">Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity
            className="size-10 rounded-full bg-white items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-900 text-base font-bold mt-3">Could not load product</Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            {error?.message ?? 'Product not found'}
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity
          className="size-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <Text className="text-gray-900 text-base font-bold">Product Details</Text>

        <TouchableOpacity
          className="size-10 rounded-full bg-gray-100 items-center justify-center relative"
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="cart-outline" size={20} color="#111827" />
          {itemCount > 0 && (
            <View className="absolute -top-1 -right-1 size-5 bg-green-600 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={['#16a34a']} />
        }
      >
        {/* Image */}
        <View className="mx-5 h-64 bg-gray-50 rounded-3xl overflow-hidden items-center justify-center">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          ) : (
            <Ionicons name="image-outline" size={64} color="#d1d5db" />
          )}

          {product.isFeatured && (
            <View className="absolute top-3 left-3 bg-green-600 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Ionicons name="star" size={12} color="white" />
              <Text className="text-white text-xs font-semibold">Featured</Text>
            </View>
          )}

          {!inStock && (
            <View className="absolute inset-0 bg-black/40 items-center justify-center">
              <View className="bg-white px-4 py-2 rounded-2xl">
                <Text className="text-gray-900 text-sm font-bold">Out of Stock</Text>
              </View>
            </View>
          )}
        </View>


        <View className="px-5 mt-5">
          <View className="flex-row items-center gap-2">
            {category && (
              <View className={`${category.bg} px-3 py-1 rounded-full flex-row items-center gap-1`}>
                <Ionicons name={category.icon} size={12} color={category.color} />
                <Text className={`${category.text} text-xs font-semibold`}>{category.label}</Text>
              </View>
            )}
            <View
              className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${inStock ? 'bg-green-50' : 'bg-red-50'
                }`}
            >
              <View className={`size-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className={`text-xs font-semibold ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          <Text className="text-gray-900 text-2xl font-bold mt-3">{product.name}</Text>

          <View className="flex-row items-end justify-between mt-3">
            <View className="flex-row items-end gap-1">
              <Text className="text-green-600 text-2xl font-bold">RS {product.price}</Text>
              <Text className="text-gray-400 text-sm mb-1">/ {product.unit}</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
              <Ionicons name="cube-outline" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-xs font-semibold">{product.stock} available</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="px-5 mt-6">
          <Text className="text-gray-900 text-base font-bold mb-2">Description</Text>
          <Text className="text-gray-500 text-sm leading-6">
            {product.description?.trim() || 'No description available for this product.'}
          </Text>
        </View>

        {/* Delivery info */}
        <View className="mx-5 mt-4 bg-green-50 rounded-2xl p-4 flex-row items-center gap-3">
          <View className="size-10 rounded-full bg-white items-center justify-center">
            <Ionicons name="bicycle" size={20} color="#16a34a" />
          </View>
          <View className="flex-1">
            <Text className="text-green-700 text-sm font-bold">Free delivery above RS 500</Text>
            <Text className="text-green-600 text-xs mt-0.5">
              Delivered in 30–60 minutes at your doorstep
            </Text>
          </View>
        </View>

        {/* Quantity */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-gray-900 text-sm font-bold">Quantity</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {!inStock
                ? 'Out of stock'
                : qty > 0
                  ? `${qty} in your cart`
                  : `Max ${product.stock} ${product.stock === 1 ? 'unit' : 'units'} available`}
            </Text>
          </View>

          <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-2 py-1">
            <TouchableOpacity
              disabled={qty === 0 || !inStock}
              onPress={handleDecrement}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className={`px-1 ${qty === 0 || !inStock ? 'opacity-30' : ''}`}
            >
              <Ionicons name="remove-circle" size={30} color="#16a34a" />
            </TouchableOpacity>
            <Text className="text-gray-900 text-base font-bold w-8 text-center">{qty}</Text>
            <TouchableOpacity
              disabled={qty >= product.stock || !inStock}
              onPress={handleIncrement}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className={`px-1 ${qty >= product.stock || !inStock ? 'opacity-30' : ''}`}
            >
              <Ionicons name="add-circle" size={30} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar - cart action only */}
      <View className="px-5 py-3 border-t border-gray-100 bg-white">
        <TouchableOpacity
          disabled={!inStock}
          onPress={() => (qty > 0 && inStock ? router.push('/cart') : handleAddToCart())}
          className={`h-14 rounded-2xl items-center justify-center flex-row gap-2 ${inStock ? 'bg-green-600' : 'bg-gray-300'
            }`}
        >
          <Ionicons
            name={qty > 0 && inStock ? 'cart' : 'cart-outline'}
            size={18}
            color="white"
          />
          <Text className="text-white text-base font-bold">
            {!inStock ? 'Out of Stock' : qty > 0 ? 'Go to Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}