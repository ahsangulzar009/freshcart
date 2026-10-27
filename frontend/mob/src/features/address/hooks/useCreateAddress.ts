import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

type CreateAddressResponse = ApiResponse<{
  message: string;
  data: {
    id: string;
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    isDefault: boolean;
    createdAt: string;
  }
}>

type createAddressInput = {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation<CreateAddressResponse, Error, createAddressInput>({
    mutationFn: async (input) => {
      const { data } = await apiRequest<CreateAddressResponse>("/address", {
        method: 'POST',
        body: JSON.stringify(input)
      })

      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      Toast.show({ type: "success", text1: response.message })
    },
    onError: (error) => {
      Toast.show({ type: "error", text1: error.message });
    }
  })

}