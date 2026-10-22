import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { clearTokens } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type LogoutAllResponse = ApiResponse<{ message?: string }>;

export function useLogoutAll() {
  const qc = useQueryClient();

  return useMutation<LogoutAllResponse, Error, void>({
    mutationFn: async () => {
      const { data } = await apiRequest<LogoutAllResponse>("/auth/logout-all", {
        method: "POST",
      });
      return data;
    },
    onSuccess: async (data) => {
      if (data.success) {
        await clearTokens();
        qc.clear();
        qc.setQueryData(["auth", "me"], { success: false, message: null });
      }
    },
  });
}