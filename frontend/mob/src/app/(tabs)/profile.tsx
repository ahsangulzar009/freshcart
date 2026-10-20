import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native'
import React from 'react'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignOut, useUser } from '@/features/auth';
import Toast from 'react-native-toast-message';

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
}

function MenuItem({ icon, label, subtitle, onPress, danger, badge }: MenuItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-4 bg-white px-5 py-4 border-b border-gray-50"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className={`size-10 rounded-2xl items-center justify-center ${danger ? 'bg-red-50' : 'bg-gray-50'}`}
      >
        <Ionicons name={icon as any} size={20} color={danger ? '#ef4444' : '#6b7280'} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-gray-900'}`}>{label}</Text>
        {
          subtitle && (
            <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
          )
        }
      </View>
      {
        badge && (
          <View className="bg-green-600 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs font-semibold">{badge}</Text>
          </View>
        )
      }
      {
        !danger && (
          <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
        )
      }
    </TouchableOpacity>
  )
}

export default function profileScreen() {
  const router = useRouter();
  const { mutateAsync: signOut, isPending } = useSignOut();
  const { data: user } = useUser()

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const result = await signOut()
          Toast.show({ type: 'success', text1: `${result.message}` })
          router.push('/(auth)')
        },
      },
    ]);
  }

  const initials = user?.data?.name
    ? user.data.name.split(' ').map((n: any) => n[0]).join('').toUpperCase()
    : user?.data?.email[0].toUpperCase() || "?"

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-white px-5 pt-6 pb-6 border-b mx-2 rounded-xl border-gray-100">
          <Text className="text-gray-900 text-2xl font-bold mb-5">Profile</Text>

          <View className="flex-row items-center gap-4">
            <View className="size-16 bg-green-600 rounded-3xl items-center justify-center">
              <Text className="text-white text-2xl font-bold">{initials}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">{user?.data?.name}</Text>
              <Text className="text-gray-400 text-sm mt-0.5">{user?.data?.email}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                  <Text className="text-green-600  text-xs font-semibold">{user?.data?.role}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="size-9 bg-gray-100 rounded-full items-center justify-center"
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="pencil" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-5 mx-3 bg-white rounded-3xl overflow-hidden border border-gray-100">
          <Text className="text-gray-400 text-xs font-semibold px-5 pt-4 pb-2 uppercase tracking-wider">
            Account
          </Text>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            subtitle="Update your name and phone"
            onPress={() => router.push('/edit-profile')}
          />
          <MenuItem
            icon="location-outline"
            label="My Addresses"
            subtitle="Manage delivery addresses"
            onPress={() => router.push('/addresses')}
          />
          <MenuItem
            icon="receipt-outline"
            label="My Orders"
            subtitle="View order history"
            onPress={() => router.push('/(tabs)/orders')}
          />
        </View>

        <View className="mt-4 mx-3 bg-white rounded-3xl overflow-hidden border border-gray-100">
          <Text className="text-gray-400 text-xs font-semibold px-5 pt-4 pb-2 uppercase tracking-wide">
            Support
          </Text>
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            subtitle="FAQs and contact us"
            onPress={() => { }}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms & Privacy"
            subtitle="Legal Information"
            onPress={() => { }}
          />
          <MenuItem
            icon="star-outline"
            label="Rate the App"
            subtitle="Share your feedback"
            onPress={() => { }}
          />
        </View>

        <View className="mt-4 mx-3 bg-white rounded-3xl overflow-hidden border border-gray-100 mb-8">
          <TouchableOpacity
            className="flex-row items-center gap-4 px-5 py-4"
            onPress={handleSignOut}
            disabled={isPending}
          >
            <View className="size-10 bg-red-50 rounded-2xl items-center justify-center">
              {
                isPending ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                )
              }
            </View>
            <Text className="text-red-500 text-sm font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}