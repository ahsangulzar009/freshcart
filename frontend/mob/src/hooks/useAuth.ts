import { BASE_URL, clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useSendOtp() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-client-type": "mobile" },
        body: JSON.stringify({ email }),
      });
      return res.json();
    }
  })
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-client-type": "mobile" },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();

      if (json.success) {
        await saveTokens(json.data.accessToken, json.data.refreshToken);
      }
      return json;
    },
    onSuccess: (json) => {
      if (json.success) {
        qc.setQueryData(["me"], { success: true, data: json.data.user });
      }
    }
  })
}

export function useSignOut() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const stored = await getRefreshToken();
        if (stored) {
          await fetch(`${BASE_URL}/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-client-type": "mobile" },
            body: JSON.stringify({ refreshToken: stored }),
          });
        }
      } catch {
      } finally {
        await clearTokens();
      }
    },
    onSettled: () => {
      qc.clear();
      qc.setQueryData(["me"], { success: false, message: null });
    },
  });
}
