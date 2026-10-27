import { apiRequest} from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { clearTokens, getRefreshToken } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type LogoutResponse = ApiResponse<{
  message: string
}>;

export function useSignOut() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      let result;
      try {
        const stored = await getRefreshToken();
        if (stored) {
          const res = await apiRequest<LogoutResponse>("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refreshToken: stored }),
          });
          result = res.data;
        }
      } catch {
      } finally {
        await clearTokens();
      }
      return result;
    },
    onSettled: () => {
      qc.setQueryData(["auth", "me"], { success: false, message: null });
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "auth" });
    },
  });
}