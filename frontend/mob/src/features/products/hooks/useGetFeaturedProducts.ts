import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useQuery } from "@tanstack/react-query";

export type GetFeaturedProductsResponse = ApiResponse<{
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
}>;

export type GetFeaturedProductsSuccessRes = Extract<GetFeaturedProductsResponse, { success: true }>;

export function useGetFeaturedProducts() {
  return useQuery<GetFeaturedProductsSuccessRes, Error>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await apiRequest<GetFeaturedProductsResponse>("/products/featured", {
        method: "GET",
      });
      if (!data.success) throw new Error(data.message);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 6 * 60 * 1000,
  });
}