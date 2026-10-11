import { Stack } from "expo-router";
import "../../global.css"
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



export default function RootLayout() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isLoading = useAuthStore(state => state.isLoading)
  const loadStoredAuth = useAuthStore(state => state.loadStoredAuth)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 bg-green-100 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  )
}
