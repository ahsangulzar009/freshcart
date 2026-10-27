import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useQuery } from "@tanstack/react-query";

export type GetAddresseByIdResponse = ApiResponse<{
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

export function useGetAddressById(id: string) {
  return useQuery<GetAddresseByIdResponse, Error>({
    queryKey: ["addresses", id],
    queryFn: async () => {
      const { data } = await apiRequest<GetAddresseByIdResponse>(
        `/address/${id}`,
        { method: "GET" }
      );

      if (!data.success) throw new Error(data.message);
      return data;
    },
    enabled: !!id,
  })
}