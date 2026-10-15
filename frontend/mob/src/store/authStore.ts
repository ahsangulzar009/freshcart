import { apiRequest, clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@/lib/storage";
import { User } from "@/types";
import { create } from "zustand";


interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  sendOtp: (email: string) => void;
  verifyOtp: (email: string, code: string) => void;
  refreshToken: () => Promise<boolean>;
  signOut: () => void;
  loadStoredAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,

  sendOtp: async (email: string) => {
    set({ isLoading: true })
    try {
      await apiRequest("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email })
      })
    } finally {
      set({ isLoading: false })
    }
  },

  verifyOtp: async (email: string, code: string) => {
    set({ isLoading: true })
    try {
      const response = await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code })
      });

      const { accessToken, refreshToken, user } = response.data;

      await saveTokens(accessToken, refreshToken)

      set({
        user,
        accessToken,
        isAuthenticated: true
      })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshToken: async () => {
    try {
      const stored = await getRefreshToken();
      if (!stored) return false;

      const res = await apiRequest("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: stored }),
      });

      await saveTokens(res.data.accessToken, res.data.refreshToken);
      set({ accessToken: res.data.accessToken });
      return true;
    } catch {
      return false;
    }
  },

  loadStoredAuth: async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      try {
        const res = await apiRequest("/auth/me");
        set({ user: res.data, accessToken: token, isAuthenticated: true });
      } catch (e: any) {
        if (e?.status !== 401) throw e;

        const ok = await get().refreshToken();
        if (!ok) throw e;

        const res = await apiRequest("/auth/me");
        set({
          user: res.data,
          accessToken: await getAccessToken(),
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.log("LOAD AUTH ERROR:", e);
      await clearTokens();
      set({ user: null, accessToken: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    try {
      const { getRefreshToken } = await import("@/lib/storage");
      const storedRefreshToken = await getRefreshToken();
      if (storedRefreshToken) {
        await apiRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: storedRefreshToken })
        })
      }

    } catch (error) {
      await clearTokens();
      set({ user: null, accessToken: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  }
}))