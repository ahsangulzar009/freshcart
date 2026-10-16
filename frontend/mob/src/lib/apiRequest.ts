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

async function request(path: string, options: RequestInit, token: string | null) {
  if (!token) return { success: false, message: "Seesion expired please login again" };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-client-type": "mobile",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({
    success: false,
    message: `Request failed (${res.status})`,
  }));

  return { status: res.status, data };
}


export async function apiRequest(
  endPoint: string,
  options: RequestInit = {}
) {
  let result = await request(endPoint, options, await getAccessToken());

  if (result.status === 401) {
    const refreshed = await refreshTokens();

    if (!refreshed.success) {
      await clearTokens();
      queryClient.setQueryData(["me"], { success: false, message: refreshed.message });
      return { status: 401, data: refreshed };
    }

    result = await request(endPoint, options, await getAccessToken());
  }

  if (result.status === 403 || result.status === 401) {
    await clearTokens();
    queryClient.setQueryData(["me"], { success: false, message: result.data.message });
    return result
  }
  
  return result;

} 