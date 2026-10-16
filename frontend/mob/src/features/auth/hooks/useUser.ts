import { apiRequest } from "@/lib/apiRequest";
import { getAccessToken } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";


export function useUser() {
  return useQuery({
    queryKey: ["auth","me"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return { success: false, message: null };
      const { data } = await apiRequest('/auth/me', { method: "GET" })

      return data;
    }
  });
}