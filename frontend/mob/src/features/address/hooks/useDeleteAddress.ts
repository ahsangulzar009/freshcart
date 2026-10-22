import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";

type DeleteAddressesResponse = ApiResponse<{
  message: string;
}>;

export function useDeleteAddress() {
  const qc = useQueryClient();

  return useMutation<DeleteAddressesResponse, Error, { ids: string[] }>({
    mutationFn: async ({ ids }) => {
      const { data } = await apiRequest<DeleteAddressesResponse>("/address", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });

      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      variables.ids.forEach((id) => {
        qc.removeQueries({ queryKey: ["addresses", id] });
      });
    },
  });
}