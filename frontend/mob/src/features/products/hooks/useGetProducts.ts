import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type GetProductsParams = {
  category?: string;
  search?: string;
  limit?: number;
};

export type GetProductsResponse = ApiResponse<{
  message: string;
  data: {
    id: string;
    name: string;
    description: string;
    category: "FRUITS" | "VEGETABLES" | "MEAT";
    price: string;
    unit: string;
    stock: number;
    imageUrl: string | null;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}>;

export type GetProductsSuccessRes = Extract<GetProductsResponse, { success: true }>;

export function useGetProducts({ category, search, limit = 40 }: GetProductsParams = {}) {
  const trimmedSearch = search?.trim();

  return useQuery<GetProductsSuccessRes, Error>({
    queryKey: ["products", { category, search: trimmedSearch, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (category && category !== "ALL") params.append("category", category);
      if (trimmedSearch) params.append("search", trimmedSearch);

      const { data } = await apiRequest<GetProductsResponse>(`/products?${params.toString()}`, {
        method: "GET",
      });
      if (!data.success) throw new Error(data.message);
      return data;
    },
    gcTime: 1000 * 60 * 3,
  });
}