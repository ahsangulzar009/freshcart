import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from 'express'

export async function getUserAddresses(req: AuthRequest, res: Response<GetUserAddressesResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }
    const userId = req.user.userId;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses.map((address) => ({
        id: address.id,
        userId: address.userId,
        label: address.label,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        state: address.state,
        isDefault: address.isDefault,
        latitude: address.latitude?.toString() ?? null,
        longitude: address.longitude?.toString() ?? null,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString()
      }))
    });

  } catch (error) {
    logger.error("getUsersAddresses controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for getting your addresses"
    });
  }
}

export type GetUserAddressesResponse = ApiResponse<{
  message: string;
  data: {
    id: string;
    userId: string;
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
  }[]
}>
