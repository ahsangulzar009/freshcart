import { apiRequest} from "@/lib/apiRequest";
import { useQuery } from "@tanstack/react-query";




export function useUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiRequest('/auth/me'),
    staleTime: 0
  });
}