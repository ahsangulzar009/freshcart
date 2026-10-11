import * as SecureStore from 'expo-secure-store';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL

export async function getAccessToken() {
  return SecureStore.getItemAsync("accessToken")
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync("refreshToken")
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
}

export async function apiRequest(
  endPoint: string,
  options: RequestInit = {}
) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${BASE_URL}${endPoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error("Somthing went wrong")
  }

  return data

} 