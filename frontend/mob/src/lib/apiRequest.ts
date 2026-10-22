import queryClient from "./queryClient";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./storage";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL

let refreshPromise: Promise<any> | null = null;
async function refreshTokens() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const stored = await getRefreshToken();
        if (!stored) return { success: false, message: "Session expired, please login again" };

        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-client-type": "mobile" },
          body: JSON.stringify({ refreshToken: stored }),
        });
        const json = await res.json();

        if (json.success) {
          await saveTokens(json.data.accessToken, json.data.refreshToken);
        }
        return json;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit,
  token: string | null
): Promise<{ status: number; data: T }> {
  if (!token) {
    return {
      status: 401,
      data: { success: false, message: "Session expired please login again" } as T,
    };
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-client-type": "mobile",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await res.json().catch(() => ({
    success: false,
    message: `Request failed (${res.status})`,
  }))) as T;

  return { status: res.status, data };
}

export async function apiRequest<T>(
  endPoint: string,
  options: RequestInit = {}
): Promise<{ status: number; data: T }> {
  let result = await request<T>(endPoint, options, await getAccessToken());

  if (result.status === 401) {
    const refreshed = await refreshTokens();

    if (!refreshed.success) {
      await clearTokens();
      queryClient.setQueryData(["auth", "me"], { success: false, message: refreshed.message });
      return { status: 401, data: refreshed as T };
    }

    result = await request<T>(endPoint, options, await getAccessToken());
  }

  if (result.status === 403 || result.status === 401) {
    await clearTokens();
    queryClient.setQueryData(["auth", "me"], {
      success: false,
      message: (result.data as { message?: string }).message,
    });
  }

  return result;
}

export const testApi = async (
  endPoint: string,
  options: RequestInit = {}
) => {
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
    throw new Error(data.message) || "Something went wrong"
  }

  return data

}