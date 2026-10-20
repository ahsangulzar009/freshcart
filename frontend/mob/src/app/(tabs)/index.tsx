import { useUser } from '@/features/auth';
import { useGetFeaturedProducts } from '@/features/products/hooks/useGetFeaturedProducts';
import { useGetProducts } from '@/features/products/hooks/useGetProducts';
import { useDebounce } from '@/lib/useDebounce';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const CATEGORIES = [
  { id: 'ALL', label: 'All', icon: 'grid' as const },
  { id: 'FRUITS', label: 'Fruits', icon: 'nutrition' as const },
  { id: 'VEGETABLES', label: 'Vegetables', icon: 'leaf' as const },
  { id: 'MEAT', label: 'Meat', icon: 'restaurant' as const },
];

const CATEGORY_LABEL: Record<string, string> = {
  FRUITS: 'Fruits',
  VEGETABLES: 'Veg',
  MEAT: 'Meat',
};

function ProductCard({
  product,
  horizontal,
}: {
  product: Product;
  horizontal?: boolean;
}) {
  const qty = useCartStore(
    (state) => state.items.find((i) => i.product.id === product.id)?.quantity ?? 0
  );
  const addItem = useCartStore((state) => state.addItem);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);

  const imageSrc = product?.imageUrl?.startsWith('http')
    ? product.imageUrl
    : `${process.env.EXPO_PUBLIC_API_URL}${product?.imageUrl}`;

  return (
    <TouchableOpacity
      className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 ${horizontal ? 'w-48' : ''
        }`}
      style={!horizontal ? { width: '47.5%' } : {}}
    >
      <View
        className={`bg-gray-50 items-center justify-center relative ${horizontal ? 'h-40' : 'h-36'
          }`}
      >
        {product?.imageUrl ? (
          <Image
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            source={{ uri: imageSrc }}
            onError={(e) =>
              console.log('IMAGE ERROR:', product.name, e.nativeEvent?.error)
            }
          />
        ) : (
          <Ionicons name="image-outline" size={36} color="#d1d5db" />
        )}

        {product?.isFeatured && (
          <View className="absolute top-2 left-2 bg-green-600 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs font-semibold">Featured</Text>
          </View>
        )}

        <View className="absolute top-2 right-2 bg-black/20 px-2 py-0.5 rounded-full">
          <Text className="text-white text-xs font-medium">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </Text>
        </View>
      </View>

      <View className="p-3">
        <Text className="text-gray-900 text-sm font-bold" numberOfLines={1}>
          {product?.name}
        </Text>

        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-gray-400 text-xs">per {product?.unit}</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="cube-outline" size={10} color="#9ca3af" />
            <Text className="text-gray-600 text-xs">{product.stock}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2.5">
          <Text className="text-green-600 text-base font-bold">
            RS {product.price}
          </Text>

          {qty === 0 ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className="bg-green-600 px-3 h-8 rounded-xl items-center justify-center flex-row gap-1"
            >
              <Ionicons name="add" size={14} color="white" />
              <Text className="text-white text-xs font-bold">Add</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center gap-1.5 bg-green-50 rounded-xl px-2 py-1">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  decrementQuantity(product.id);
                }}
              >
                <Ionicons name="remove" size={20} color="#16a34a" />
              </TouchableOpacity>
              <Text className="text-gray-900 text-sm font-bold text-center min-w-4">
                {qty}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  incrementQuantity(product.id);
                }}
              >
                <Ionicons name="add" size={20} color="#16a34a" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}



export default function HomeScreen() {
  const { data: user } = useUser();
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const cartAnim = useRef(new Animated.Value(0)).current;
  const debouncedSearch = useDebounce(search);

  const {
    data: productsRes,
    isPending: pendingProducts,
    isFetching: loadingProducts,
    isRefetching: refetchingProducts,
    refetch: refetchProducts,
  } = useGetProducts({ category: activeCategory, search: debouncedSearch });
  const products: Product[] = productsRes?.data?.data ?? [];

  const {
    data: featuredRes,
    isFetching: loadingFeaturedProducts,
    isRefetching: refetchingFeatured,
    refetch: refetchFeatured,
  } = useGetFeaturedProducts();
  const featured: Product[] = featuredRes?.data?.data ?? [];

  const refreshing = refetchingProducts || refetchingFeatured;

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = getTotal();
  const hasItems = itemCount > 0;

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  useEffect(() => {
    Animated.spring(cartAnim, {
      toValue: hasItems ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [hasItems]);

  useEffect(() => {
    const failed = [productsRes?.data, featuredRes?.data].find(
      (r) => r && r.success === false
    );
    if (failed) {
      Toast.show({ type: 'error', text1: failed.message ?? 'Something went wrong' });
    }
  }, [productsRes, featuredRes]);

  const listHeader = (
    <View>
      {/* Header */}
      <View className="bg-green-600 px-5 pt-7 pb-6">
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text className="text-green-100 text-sm">{greeting()}, 👋</Text>
            <Text className="text-white text-xl font-bold mt-0.5">
              {user?.data?.name || user?.data?.email?.split('@')[0] || 'there'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/cart')}
            className="size-11 bg-white/20 rounded-full items-center justify-center relative"
          >
            <Ionicons name="cart-outline" size={22} color="white" />
            {hasItems && (
              <View className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white rounded-2xl px-4 h-12 gap-3">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 text-gray-900 text-sm"
            placeholder="Search fruits, vegetables, meat..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Offer banner */}
      <View className="mx-2 mt-4 bg-green-600 rounded-3xl p-5 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-green-100 text-xs font-medium">LIMITED OFFER</Text>
          <Text className="text-white text-xl font-bold mt-1">
            Free delivery{'\n'}on first order!
          </Text>
          <TouchableOpacity className="bg-white mt-3 px-4 py-2 rounded-xl self-start">
            <Text className="text-green-600 text-xs font-bold">ORDER NOW</Text>
          </TouchableOpacity>
        </View>
        <View className="size-24 bg-white/10 rounded-full items-center justify-center">
          <Ionicons name="bicycle" size={48} color="white" />
        </View>
      </View>

      {/* Categories */}
      <View className="mt-6 px-5">
        <Text className="text-gray-900 text-lg font-bold mb-3">Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className={`flex-row items-center gap-2 px-4 py-2.5 rounded-2xl border ${activeCategory === cat.id
                  ? 'bg-green-600 border-green-600'
                  : 'bg-white border-gray-200'
                  }`}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={activeCategory === cat.id ? 'white' : '#6b7280'}
                />
                <Text
                  className={`text-sm font-semibold ${activeCategory === cat.id ? 'text-white' : 'text-gray-600'
                    }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Featured (horizontal FlatList) */}
      {activeCategory === 'ALL' && !search && (
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text className="text-gray-900 text-lg font-bold">Featured</Text>
            <Text className="text-green-500 text-sm font-medium">See All</Text>
          </View>

          {loadingFeaturedProducts && featured.length === 0 ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#16a34a" />
              <Text className="text-gray-400 text-xs mt-2">Loading featured...</Text>
            </View>
          ) : featured.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-gray-400 text-xs">No featured products</Text>
            </View>
          ) : (
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
              renderItem={({ item }) => <ProductCard product={item} horizontal />}
            />
          )}
        </View>
      )}

      {/* All products title */}
      <View className="px-5 mt-6 mb-3 flex-row items-center justify-between">
        <Text className="text-gray-900 text-lg font-bold">
          {activeCategory === 'ALL'
            ? 'All Products'
            : CATEGORIES.find((c) => c.id === activeCategory)?.label}
        </Text>
        {loadingProducts && products.length > 0 && (
          <ActivityIndicator size="small" color="#16a34a" />
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-gray-50">
        <FlatList
          data={pendingProducts ? [] : products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={listHeader}
          columnWrapperStyle={{
            gap: 12,
            paddingHorizontal: 13,
            marginBottom: 12,
          }}
          contentContainerStyle={{ paddingBottom: hasItems ? 70 : 0 }}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            pendingProducts ? (
              <View className="items-center py-12">
                <ActivityIndicator size="large" color="#16a34a" />
                <Text className="text-gray-400 text-sm mt-2">Loading products...</Text>
              </View>
            ) : (
              <View className="items-center py-12">
                <Ionicons name="search-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-400 text-sm mt-2">No products found</Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetchProducts();
                refetchFeatured();
              }}
              colors={['#16a34a']}
            />
          }
          initialNumToRender={6}
          windowSize={7}
          removeClippedSubviews={false}
        />

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            left: 10,
            transform: [
              {
                translateY: cartAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [120, 0],
                }),
              },
            ],
            opacity: cartAnim,
          }}
          pointerEvents={hasItems ? 'auto' : 'none'}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/cart')}
          >
            <View className="bg-green-600 rounded-3xl px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-white/20 rounded-2xl px-3 py-1.5 flex-row items-center gap-1.5">
                  <Ionicons name="cart" size={14} color="white" />
                  <Text className="text-white text-xs font-bold">{itemCount}</Text>
                </View>

                <View>
                  <Text className="text-white text-sm font-bold">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </Text>
                  <Text className="text-green-100 text-xs">Tap to review order</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2 bg-white/15 rounded-2xl px-3 py-2">
                <Text className="text-white text-base font-bold">
                  RS {total.toFixed(0)}
                </Text>
                <View className="size-5 bg-white rounded-full items-center justify-center">
                  <Ionicons name="arrow-forward" size={12} color="#16a34a" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}


