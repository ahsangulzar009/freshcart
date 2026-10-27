import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useQuery } from "@tanstack/react-query";


export type GetMyOrdersResponse = ApiResponse<{
  message: string;
  orders: {
    id: string;
    orderNumber: string;
    status: "PENDING" | "CONFIRMED" | "PREPARING" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    paymentMethod: "COD" | "ONLINE";
    subtotal: string;
    deliveryFee: string;
    discount: string;
    total: string;
    notes: string | null;
    createdAt: string;
    cancelledAt: string | null;
    cancelReason: string | null;
    address: {
      id: string;
      label: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
    };
    items: {
      id: string;
      quantity: number;
      unitPrice: string;
      total: string;
      product: {
        id: string;
        name: string;
        imageUrl: string | null;
        unit: string;
      };
    }[]
  }[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean
  }
}>

export type GetMyOrdersSuccessRes = Extract<GetMyOrdersResponse, { success: true }>

export type GetMyOrdersParams = {
  page?: number;
  limit?: number;
};

export function useGetMyOrders({ page = 1, limit = 10 }: GetMyOrdersParams = {}) {
  return useQuery<GetMyOrdersSuccessRes, Error>({
    queryKey: ["orders", { page, limit }],
    queryFn: async () => {
      const { data } = await apiRequest<GetMyOrdersResponse>(`/orders/my?page=${page}&limit=${limit}`, {
        method: "GET"
      });
      if (!data.success) throw new Error(data.message);
      return data
    }
  })
}