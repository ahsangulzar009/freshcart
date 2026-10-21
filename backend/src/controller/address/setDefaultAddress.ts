import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from "express";

export async function setDefaultAddress(req: AuthRequest, res: Response<SetDefaultAddressResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;
    const addressId = String(req.params.id);

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    if (address.isDefault) {
      return res.status(200).json({
        success: true,
        message: "This Address is already default"
      });
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      })
    ]);

    logger.info("Default Address Set", { addressId, userId });

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully"
    });
  } catch (error) {
    logger.error("setDefaultAddress controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for setting default address"
    });
  }
}

export type SetDefaultAddressResponse = ApiResponse<{
  message: string;
}>;