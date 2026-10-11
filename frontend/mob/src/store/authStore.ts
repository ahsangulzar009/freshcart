import { apiRequest, clearTokens, getAccessToken, saveTokens } from "@/lib/api";
import { User } from "@/types";
import { create } from "zustand";


interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  sendOtp: (email: string) => void;
  verifyOtp: (email: string, code: string) => void;
  refreshToken: () => void;
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
      const { getRefreshToken } = await import("@/lib/api");
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) throw new Error("No refresh token");

      const response = await apiRequest("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });

      const { accessToken, refreshToken } = response.data;
      await saveTokens(accessToken, refreshToken);
      set({ accessToken })

    } catch {
      await get().signOut()
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true })
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ isLoading: false })
        return;
      }

      const response = await apiRequest("/auth/me");
      set({
        user: response.data,
        accessToken: token,
        isAuthenticated: true
      })

    } catch {
      await clearTokens();
      set({ user: null, accessToken: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    try {
      const { getRefreshToken } = await import("@/lib/api");
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