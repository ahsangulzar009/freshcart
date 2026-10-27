import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useQuery } from "@tanstack/react-query";

export type GetOrderByIdResponse = ApiResponse<{
  message: string;
  order: {
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
    estimatedAt: string | null;
    deliveredAt: string | null;
    customer: {
      id: string;
      email: string;
      name: string | null;
      phone: string | null;
    };
    deliveryPartner: {
      id: string;
      email: string;
      name: string | null;
      phone: string | null;
    } | null;
    statusHistory: {
      id: string;
      status: "PENDING" | "CONFIRMED" | "PREPARING" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
      note: string | null;
      createdAt: string;
    }[];
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
    }[];
  };
}>;

export type GetOrderByIdSuccessRes = Extract<GetOrderByIdResponse, { success: true }>;

export function useGetOrderById(id?: string) {
  return useQuery<GetOrderByIdSuccessRes, Error>({
    queryKey: ["orders", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await apiRequest<GetOrderByIdResponse>(`/orders/${id}`, {
        method: "GET",
      });
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });
}