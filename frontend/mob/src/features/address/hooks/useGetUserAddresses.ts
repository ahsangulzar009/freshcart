import { apiRequest } from "@/lib/apiRequest";
import { ApiResponse } from "@/lib/ApiRespnse";
import { useQuery } from "@tanstack/react-query";


type GetUserAddressesResponse = ApiResponse<{
  message: string;
  data: {
    id: string;
    label: string;
    userId: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
    latitude: string | null;
    longitude: string | null;
    createdAt: string;
    updatedAt: string;
  }[]
}>

export type UserSuccessRes = Extract<GetUserAddressesResponse, {success: true}>

export function useGetUserAddresses() {
  return useQuery<UserSuccessRes, Error>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await apiRequest<GetUserAddressesResponse>("/address", {
        method: 'GET'
      })
      if (!data.success) throw new Error(data.message);
      return data
    }
  })
}