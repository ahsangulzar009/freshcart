"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCurrentUser, logout as logoutRequest, type CurrentUserResponse } from "@/lib/auth";

export type User = Extract<CurrentUserResponse, { success: true }>["data"];

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  async function refetch() {
    const res = await getCurrentUser();
    setUser(res.success ? res.data : null);
    setLoading(false);
  }

  useEffect(() => {
    if (fetchedRef.current) return; 
    fetchedRef.current = true;
    refetch();
  }, [refetch]);

  async function logout() {
    await logoutRequest();
    setUser(null);
  }


  return (
    <AuthContext.Provider value={{ user, loading, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}