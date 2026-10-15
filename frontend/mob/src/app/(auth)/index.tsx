
import { useSendOtp } from '@/features/auth';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const { mutateAsync: sendOtp, isPending: isLoading } = useSendOtp()
  const router = useRouter()

  async function handleOtp() {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email")
      return;
    }

    const emailRegix = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegix.test(email)) {
      Alert.alert("Error", "Please enter a valid email")
      return;
    }
    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await sendOtp(cleanEmail);
      if (!data.success) {
        Alert.alert("Error", data.message);
        return;
      }
      router.push(`/(auth)/login?email=${encodeURIComponent(email.trim().toLowerCase())}`)

    } catch {
      Alert.alert("Error", "Network error, please try again")
    }

  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView className=" bg-white" behavior={Platform.OS === 'ios' ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-green-600 px-6 pt-20 pb-12 items-center">
            <View className="size-20 bg-white rounded-3xl items-center justify-center mb-5">
              <Ionicons name="cart" size={40} color={"#16a34a"} />
            </View>
            <Text className="text-white text-4xl font-bold tracking-tight">Fresh Cart</Text>
            <Text className="text-green-100 text-base mt-2 text-center">
              Farm fresh fruits, vegetables & meat{'\n'}delivered to your doorstep
            </Text>

            <View className="flex-row mt-6 gap-3">
              <View className="bg-white/20 px-4 py-1.5 rounded-full flex-row items-center gap-1.5">
                <Ionicons name="nutrition" size={14} color="white" />
                <Text className="text-white text-xs font-medium">Fruits</Text>
              </View>

              <View className="bg-white/20 px-4 py-1.5 rounded-full flex-row items-center gap-1.5">
                <Ionicons name="leaf" size={14} color="white" />
                <Text className="text-white text-xs font-medium">Vegetables</Text>
              </View>

              <View className="bg-white/20 px-4 py-1.5 rounded-full flex-row items-center gap-1.5">
                <Ionicons name="restaurant" size={14} color="white" />
                <Text className="text-white text-xs font-medium">Meat</Text>
              </View>

            </View>
          </View>

          <View className="flex-1 px-6 pt-10 pb-8">
            <Text className="text-gray-900 text-2xl font-bold">Get Started</Text>
            <Text className="text-gray-500 text-sm mt-1 mb-8">
              Enter your email to receive a one-time password
            </Text>

            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2">Email Address</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
                <Ionicons name="mail-outline" size={20} color={"#9ca3af"} />
                <TextInput
                  placeholder="your@example.com"
                  placeholderTextColor={"#9ca3af"}
                  className="flex-1 ml-3 text-gray-900 text-base"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            <TouchableOpacity
              className={`h-14 rounded-2xl items-center justify-center flex-row gap-2 ${isLoading ? 'bg-green-300' : 'bg-green-600'
                }`}
              activeOpacity={0.85}
              disabled={isLoading}
              onPress={handleOtp}
            >
              {
                isLoading ? (
                  <Ionicons name="reload-outline" size={20} color={"white"} />
                )
                  : (
                    <>
                      <Text className="text-white text-base font-semibold">Sent Otp</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )
              }
            </TouchableOpacity>
            <View className="flex-row justify-between mt-12">
              <View className="items-center flex-1">
                <View className="size-12 bg-green-50 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="flash" size={22} color="#16a34a" />
                </View>
                <Text className="text-gray-700 text-xs font-medium">Fast Delivery</Text>
                <Text className="text-gray-400 text-xs text-center mt-0.5">Within 60 mins</Text>
              </View>

              <View className="items-center flex-1">
                <View className="size-12 bg-green-50 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="leaf" size={22} color="#16a34a" />
                </View>
                <Text className="text-gray-700 text-xs font-medium">Farm Fresh</Text>
                <Text className="text-gray-400 text-xs text-center mt-0.5">Direct from farm</Text>
              </View>

              <View className="items-center flex-1">
                <View className="size-12 bg-green-50 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="shield-checkmark" size={22} color="#16a34a" />
                </View>
                <Text className="text-gray-700 text-xs font-medium">100% Secure</Text>
                <Text className="text-gray-400 text-xs text-center mt-0.5">Safe payment</Text>
              </View>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}