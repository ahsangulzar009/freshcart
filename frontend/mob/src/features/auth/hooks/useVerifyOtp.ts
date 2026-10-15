import { BASE_URL } from "@/lib/apiRequest";
import { saveTokens } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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