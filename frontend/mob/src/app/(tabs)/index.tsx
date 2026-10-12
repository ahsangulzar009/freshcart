import { apiRequest } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';


const CATEGORIES = [
  { id: "ALL", label: "All", icon: "grid" as const },
  { id: "FRUITS", label: "Fruits", icon: "nutrition" as const },
  { id: "VEGETABLES", label: "Vegetables", icon: "leaf" as const },
  { id: "MEAT", label: "Meat", icon: "restaurant" as const }
]

export default function HomeScreen() {
  const user = useAuthStore(state => state.user)
  const addItem = useCartStore(state => state.addItem);
  const incrementQuantity = useCartStore(state => state.incrementQuantity);
  const decrementQuantity = useCartStore(state => state.decrementQuantity);
  const getItemQuantity = useCartStore(state => state.getItemQuantity);
  const getItemCount = useCartStore(state => state.getItemCount);
  const getTotal = useCartStore(state => state.getTotal);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cartAnim = useRef(new Animated.Value(0)).current

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  useEffect(() => {
    Animated.spring(cartAnim, {
      toValue: getItemCount() > 0 ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    })
  }, [getItemCount() > 0])

  async function fetchProducts() {
    try {
      const params = new URLSearchParams({ limit: "20" })
      if (activeCategory !== "ALL") params.append('category', activeCategory)
      if (search) params.append('search', search)

      const [productRes, featuredRes] = await Promise.all([
        apiRequest(`/products?${params.toString()}`),
        apiRequest('/products/featured')
      ])

      setProducts(productRes.data)
      setFeatured(featuredRes.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false);
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [activeCategory, search]);

  function onRefresh() {
    setRefreshing(true);
    fetchProducts();
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-gray-50">
        <ScrollView showsVerticalScrollIndicator={false}>

          <View className="bg-green-600 px-5 pt-7 pb-6">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-green-100 text-sm">{greeting()}, 👋</Text>
                <Text className="text-white text-xl font-bold mt-0.5">
                  {user?.name || user?.email.split('@')[0] || 'there'}
                </Text>
              </View>

              <TouchableOpacity className="size-11 bg-white/20 rounded-full items-center justify-center relative">
                <Ionicons name="cart-outline" size={22} color="white" />
                {
                  getItemCount() > 0 && (
                    <View className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full items-center">
                      <Text className="text-white text-xs font-bold">{getItemCount()}</Text>
                    </View>
                  )
                }
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-white rounded-2xl px-4 h-12 gap-3">
              <Ionicons name="search-outline" size={20} color={"#9ca3af"} />
              <TextInput
                className="flex-1 text-gray-900 text-sm"
                placeholder="Search fruits, vegetables, meat..."
                placeholderTextColor={"#9ca3af"}
                value={search}
                onChangeText={setSearch}
              />
              {
                search ? (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={18} color={"#9ca3af"} />
                  </TouchableOpacity>
                ) : null
              }
            </View>
          </View>

          <View className="mx-5 mt-5 bg-green-600 rounded-3xl p-5 flex-row items-center justify-between">
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
              <Ionicons name="bicycle" size={48} color={"white"} />
            </View>
          </View>

          <View className="mt-6 px-5">
            <Text className="text-gray-900 text-lg font-bold mb-3">Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {
                  CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      className={`flex-row items-center gap-2 px-4 py-2.5 rounded-2xl border ${activeCategory === cat.id ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}
                      key={cat.id}
                      onPress={() => setActiveCategory(cat.id)}
                    >
                      <Ionicons name={cat.icon} size={16} color={activeCategory === cat.id ? "white" : "#6b7280"} />
                      <Text className={`text-sm font-semibold ${activeCategory === cat.id ? "text-white" : "text-gray-600"} `}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))
                }
              </View>
            </ScrollView>
          </View>

          {
            featured?.length > 0 && activeCategory === 'ALL' && !search && (
              <View className="mt-6">
                <View className="flex-row items-center justify-between px-5 mb-3">
                  <Text className="text-gray-900 text-lg font-bold">Featured</Text>
                  <Text className="text-green-500 text-sm font-medium">See All</Text>
                </View>
                <ScrollView className="pl-5" horizontal showsHorizontalScrollIndicator={false}>
                  {/* <View>
                    {
                      featured?.map((product)=>(
                        <ProductCard key={product.id} product={product} horizontal/>
                      ))
                    }
                  </View> */}

                </ScrollView>
              </View>
            )
          }

          <View>
            <Text>
              {activeCategory === 'ALL' ? "All Products" : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}