import { BASE_URL } from "@/lib/apiRequest";
import { useMutation } from "@tanstack/react-query";

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