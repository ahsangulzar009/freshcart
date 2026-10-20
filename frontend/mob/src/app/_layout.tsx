import "../../global.css";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";
import { useUser } from "@/features/auth";
import Toast from "react-native-toast-message";
import { useEffect } from "react";

function RootNavigator() {
  const { data: auth, isLoading } = useUser();
  const isAuthenticated = !!auth?.success;


  useEffect(() => {
    if (auth && !auth.success && auth.message) {
      Toast.show({ type: "error", text1: auth.message });
    }
  }, [auth]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 bg-green-100 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }


  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="add-address" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <Toast topOffset={insets.top + 10} />
    </QueryClientProvider>
  );
}