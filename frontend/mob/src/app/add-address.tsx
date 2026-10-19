import { testApi } from '@/lib/apiRequest';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const LABELS = ["Home", 'Work', 'Other']

const AddAddressScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState("Home");
  const [form, setForm] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: ''
  })

  async function handleSubmit() {
    if (!form.line1.trim()) {
      Alert.alert("Error", "Address line1 is required")
      return;
    }
    if (!form.city.trim()) {
      Alert.alert("Error", "City is required")
      return;
    }
    if (!form.state.trim()) {
      Alert.alert("Error", "State is required")
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      Alert.alert("Error", "Enter a valid 6-digit pincode")
      return;
    }

    setIsLoading(true)

    try {
      await testApi('/address', {
        method: 'POST',
        body: JSON.stringify({ label, ...form })
      })
      Toast.show({ type: "success", text1: "Address added successfully" })
    } catch (error) {
      Alert.alert("Error", (error as Error).message)
    } finally {
      setIsLoading(false)
    }

  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 pt-4 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="size-10 rounded-full bg-gray-100 items-center justify-center mr-3">
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold">Add Address</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 pt-5 pb-36 gap-5">
            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-3">Address Label</Text>
              <View className="flex-row gap-3">
                {
                  LABELS.map((l) => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => setLabel(l)}
                      className={`flex-1 py-3 rounded-2xl items-center border-2 ${label === l ? 'bg-green-600 border-green-200' : 'bg-white border-gray-200'
                        }`}
                    >
                      <Ionicons
                        name={
                          l === 'Home' ? 'home-outline' : l === 'Work' ? 'briefcase-outline' : 'location-outline'
                        }
                        size={18}
                        color={label === l ? "white" : '#6b7280'}
                      />
                      <Text className={`text-xs font-semibold mt-1 ${label === l ? 'text-white' : 'text-gray-600'}`}>
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))
                }
              </View>
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Addres Line1 <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border-gray-200 rounded-2xl px-4 h-14 text-gray-900 text-sm"
                placeholder="Area, Landmark, Apartment / Floor (optional)"
                placeholderTextColor="#9ca3af"
                value={form.line1}
                onChangeText={(v) => setForm({ ...form, line1: v })}

              />
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Addres Line2 (optional)
              </Text>
              <TextInput
                className="bg-white border-gray-200 rounded-2xl px-4 h-14 text-gray-900 text-sm"
                placeholder="House No, Building, Street"
                placeholderTextColor="#9ca3af"
                value={form.line2}
                onChangeText={(v) => setForm({ ...form, line2: v })}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-700 text-sm font-semibold mb-2">
                  City <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-white border-gray-200 rounded-2xl px-4 h-14 text-gray-900 text-sm"
                  placeholder="Lahore"
                  placeholderTextColor="#9ca3af"
                  value={form.city}
                  onChangeText={(v) => setForm({ ...form, city: v })}
                />
              </View>

              <View className="flex-1">
                <Text className="text-gray-700 text-sm font-semibold mb-2">
                  State <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-white border-gray-200 rounded-2xl px-4 h-14 text-gray-900 text-sm"
                  placeholder="Punjab"
                  placeholderTextColor="#9ca3af"
                  value={form.state}
                  onChangeText={(v) => setForm({ ...form, state: v })}
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Pincode <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border-gray-200 rounded-2xl px-4 h-14 text-gray-900 text-sm"
                placeholder="Pincode"
                placeholderTextColor="#560001"
                value={form.pincode}
                onChangeText={(v) => setForm({ ...form, pincode: v })}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

          </View>
        </ScrollView>

        <View className="bg-white border-gray-100 px-5 py-4 pb-8">
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isLoading}
            className={`h-14 rounded-2xl items-center justify-center ${isLoading ? "bg-green-400" : 'bg-green-600'}`}
          >
            {
              isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-semibold">Save Address</Text>
              )
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AddAddressScreen