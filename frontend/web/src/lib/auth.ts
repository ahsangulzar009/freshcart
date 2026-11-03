import { apiRequest, BASE_URL } from "./apiRequest";
import { ApiResponse } from "./ApiRespnse";

export type CurrentUserResponse = ApiResponse<{
  data: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
  }
}>;

export async function sendOtp(email: string) {
  const res = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();

}

export async function verifyOtp(email: string, code: string) {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-client-type": "web" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();

  return data;
}

export async function getCurrentUser() {
  const { data } = await apiRequest<CurrentUserResponse>("/auth/me", {
    method: "GET",
    headers: { "x-client-type": "web" },
  });
  return data;
}

export async function logout() {
  const res = await apiRequest("/auth/logout", {
    method: "POST",
    headers: { "x-client-type": "web" }
  });
  return res.data;
}

