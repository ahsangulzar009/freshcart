import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { getAccessToken } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";

type CurrentUserResponse = ApiResponse<{
  data: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
  }
}>;


export function useUser() {
  return useQuery<CurrentUserResponse, Error>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return { success: false, message: "" }; 
      const { data } = await apiRequest<CurrentUserResponse>("/auth/me", {
        method: "GET",
      });
      return data;
    },
  });
}