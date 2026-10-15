import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSendOtp, useVerifyOtp } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { mutate: verifyOtp, isPending: isLoading } = useVerifyOtp()
  const { mutate: sendOtp } = useSendOtp();
  const router = useRouter();

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true)
      return;
    }

    const interval = setInterval(() => setTimer(t => t - 1), 1000)

    return () => clearInterval(interval)
  }, [timer])

  function handleOtpChange(value: string, index: number) {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp]
    newOtp[index] = value;
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleVerify() {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6 Digit OTP");
      return;
    }

    verifyOtp(
      { email, code },
      {
        onSuccess: (json) => {
          if (!json.success) {
            Alert.alert("Error", json.message);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
          }
        },
        onError: () => {
          Alert.alert("Error", "Network error, please try again");
        },
      }
    );
  }

  function handleResend() {
    if (!canResend) return;

    sendOtp(email, {
      onSuccess: (json) => {
        if (!json.success) {
          Alert.alert("Error", json.message);
          return;
        }
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      },
      onError: () => {
        Alert.alert("Error", "Network error, please try again");
      },
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="bg-green-600 px-6 pt-16 pb-10 items-center">
          <View className="size-16 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm">
            <Ionicons name="cart" size={32} color="#16a34a" />
          </View>
          <Text className="text-white text-3xl font-bold">FreshCart</Text>
        </View>

        <View className="flex-1 px-6 pt-10 ">
          <TouchableOpacity className="flex-row items-center gap-1 mb-6">
            <Ionicons name="arrow-back" size={20} color="#16a34a" />
            <Text>Change email</Text>
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl font-bold">
            Check your email
          </Text>
          <Text className="text-gray-500 text-sm mt-1 mb-2">
            We sent a 6-digit code to
          </Text>
          <Text className="text-green-600 text-sm font-semibold mb-8">{email}</Text>

          <View className="flex-row gap-3 justify-between mb-8">
            {
              otp.map((digit, index) => (
                <TextInput
                  className={`flex-1 h-14 rounded-2xl text-center text-xl font-bold border-2 ${digit ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-900"}`}
                  value={digit}
                  onChangeText={(value => handleOtpChange(value, index))}
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref }}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType='number-pad'
                  maxLength={1}
                  selectTextOnFocus
                />
              ))
            }
          </View>

          <TouchableOpacity onPress={handleVerify} className={`h-14 rounded-2xl items-center justify-center ${isLoading ? "bg-green-400" : "bg-green-600"}`}>
            {
              isLoading ? (
                <Ionicons name="reload-outline" size={20} color={"white"} />
              ) : (
                <Text className="text-white text-base font-semibold">Verify OTP</Text>
              )
            }
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-gray-500 text-sm">Dindn't receive the code?</Text>
            <TouchableOpacity onPress={handleResend} disabled={!canResend}>
              <Text className={`text-sm font-semibold ${canResend ? 'text-green-600' : 'text-gray-400'}`}>
                {canResend ? 'Resend' : `Resend in ${timer}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}