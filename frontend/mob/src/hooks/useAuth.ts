import { BASE_URL, clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

let refreshPromise: Promise<any> | null = null;

export async function refreshTokens() {
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

export function useUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return { success: false, message: null };

      let res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, "x-client-type": "mobile" },
      });
      let json = await res.json();

      if (res.status === 401) {
        const refreshed = await refreshTokens();

        if (!refreshed.success) {
          await clearTokens();
          return refreshed; 
        }

        const newToken = await getAccessToken();
        res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}`, "x-client-type": "mobile" },
        });
        json = await res.json();
      }
      if (res.status === 401 || res.status === 403) {
        await clearTokens();
        return json;
      }
      if (!res.ok) throw new Error(json.message);

      return json; 
    },
  });
}
