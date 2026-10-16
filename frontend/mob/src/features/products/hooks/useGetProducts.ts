import { apiRequest } from "@/lib/apiRequest";
import { useQuery } from "@tanstack/react-query";

type Params = {
  category?: string;
  search?: string;
  limit?: number;
};

export function useGetProducts({ category, search, limit = 40 }: Params) {
  return useQuery({
    queryKey: ['products', { category, search }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (category && category !== 'ALL') params.append('category', category);
      if (search) params.append('search', search.trim());

      const res = await apiRequest(`/products?${params.toString()}`);
      return res
    },
    gcTime: 1000 * 60 * 3,
  })
}