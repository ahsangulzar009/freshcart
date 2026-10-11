import { Stack } from "expo-router";
import "../../global.css"
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      {/* <StatusBar style="dark"/> */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        <Stack.Screen name="(auth)" options={{headerShown: false}}/>
      </Stack>
    </>
  )
}
