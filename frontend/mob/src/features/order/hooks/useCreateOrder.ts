import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export type CreateOrderResponse = ApiResponse<{
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
    customerId: string;
    addressId: string;
    items: {
      id: string;
      quantity: number;
      unitPrice: string;
      total: string;
    }[]
  }
}>

type createOrderInput = {
  addressId: string;
  paymentMethod: "COD" | "ONLINE";
  items: {
    productId: string;
    quantity: number;
  }[]
}

export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation<CreateOrderResponse, Error, createOrderInput>({
    mutationFn: async (input: createOrderInput) => {
      const { data } = await apiRequest<CreateOrderResponse>("/orders", {
        method: 'POST',
        body: JSON.stringify(input)
      })

      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      Toast.show({ type: "success", text1: response.message })
    },
    onError: (error) => {
      Toast.show({ type: "error", text1: error.message });
    }
  })
}