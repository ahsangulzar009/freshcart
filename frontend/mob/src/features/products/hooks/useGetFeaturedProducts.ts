import { apiRequest } from "@/lib/apiRequest";
import { useQuery } from "@tanstack/react-query";


export function useGetFeaturedProducts(){
  return useQuery({
    queryKey:["products", "featured"],
    queryFn: async ()=>{
      const res = await apiRequest('/products/featured');

      return res
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 6 * 60 * 1000
  })
}