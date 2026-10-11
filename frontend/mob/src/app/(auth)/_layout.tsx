import {Stack} from 'expo-router'


const AuthLayput = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="login" options={{ title: "Login"}}/>
    </Stack>
  )
}

export default AuthLayput