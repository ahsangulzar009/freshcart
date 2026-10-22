import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type SetDefaultAddressResponse = ApiResponse<{
  message: string;
}>;

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation<SetDefaultAddressResponse, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const { data } = await apiRequest<SetDefaultAddressResponse>(`/address/${id}/default`, {
        method: "PATCH",
      });

      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    }
  })
}