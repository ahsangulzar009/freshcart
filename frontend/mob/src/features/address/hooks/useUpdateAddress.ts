import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateAddressResponse = ApiResponse<{
  message: string;
  data: {
    id: string;
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    isDefault: boolean;
    latitude: string | null;
    longitude: string | null;
    createdAt: string;
    updatedAt: string;
  }
}>

type UpdateAddressInput = {
  label?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  latitude?: string | null;
  longitude?: string | null;
};

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation<UpdateAddressResponse, Error, { id: string, payload: UpdateAddressInput }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiRequest<UpdateAddressResponse>(`/address/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    }
  })
}