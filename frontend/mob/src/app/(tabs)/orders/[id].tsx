import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native'


export default function GetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View>
      <Text>Order {id}</Text>
    </View>
  )
}