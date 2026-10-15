import { BASE_URL } from "@/lib/apiRequest";
import { clearTokens, getRefreshToken } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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