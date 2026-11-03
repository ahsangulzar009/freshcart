import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useQuery } from "@tanstack/react-query";

export type GetProductByIdResponse = ApiResponse<{
  message: string;
  product: {
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
  };
}>;

export type GetProductByIdSuccessRes = Extract<GetProductByIdResponse, { success: true }>;

export function useGetProductById(id: string) {
  return useQuery<GetProductByIdSuccessRes, Error>({
    queryKey: ["products", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await apiRequest<GetProductByIdResponse>(`/products/${id}`, {
        method: "GET",
      });
      if (!data.success) throw new Error(data.message);
      return data;
    },
    gcTime: 1000 * 60 * 3,
  });
}
