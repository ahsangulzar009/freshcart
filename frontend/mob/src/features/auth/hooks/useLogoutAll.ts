import { apiRequest } from "@/lib/apiRequest";
import { clearTokens } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function useLogoutAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiRequest('/auth/logout-all', { method: "POST" })
      return data
    },
    onSuccess: async (data) => {
      if (data.success) {
        await clearTokens();
        qc.clear();
        qc.setQueryData(["auth","me"], { success: false, message: null });
      }
    }
  })
}