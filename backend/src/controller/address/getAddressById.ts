import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from 'express'


export async function getAddressById(req: AuthRequest, res: Response<GetAddresseByIdResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }
    const userId = req.user.userId
    const addressId = String(req.params.id);

    const address = await prisma.address.findUnique({ where: { id: addressId, userId } })
    if (!address || address.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: {
        id: address.id,
        label: address.label,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
        latitude: address.latitude?.toString() ?? null,
        longitude: address.longitude?.toString() ?? null,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString()
      }
    });

  } catch (error) {
    logger.error("getAddresseById controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for getting your addresse"
    });
  }
}

export type GetAddresseByIdResponse = ApiResponse<{
  message: string;
  data: {
    id: string;
    label: string;
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
  }
}>