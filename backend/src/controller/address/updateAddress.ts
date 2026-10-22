import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from 'express'

export async function updateAddress(req: AuthRequest, res: Response<UpdateAddressResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;
    const body = req.body;
    const addressId = String(req.params.id)

    const address = await prisma.address.findUnique({ where: { id: addressId } })
    if (!address || address.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        label: body.label,
        line1: body.line1,
        line2: body.line2,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        isDefault: body.isDefault,
        latitude: body.latitude,
        longitude: body.longitude
      }
    })

  logger.info("Address Updated", { addressId: updatedAddress.id, userId });

  return res.status(200).json({
    success: true,
    message: "Address updated successfully",
    data: {
      id: updatedAddress.id,
      label: updatedAddress.label,
      line1: updatedAddress.line1,
      line2: updatedAddress.line2 ?? null,
      city: updatedAddress.city,
      state: updatedAddress.state,
      pincode: updatedAddress.pincode,
      isDefault: updatedAddress.isDefault,
      latitude: updatedAddress.latitude?.toString() ?? null,
      longitude: updatedAddress.longitude?.toString() ?? null,
      createdAt: updatedAddress.createdAt.toISOString(),
      updatedAt: updatedAddress.updatedAt.toISOString()
    }
  });

} catch (error) {
  logger.error("updateAddress controller error", { error: (error as Error).message });
  return res.status(500).json({
    success: false,
    message: "Internal Server Error for updating your address"
  });
}
}

export type UpdateAddressResponse = ApiResponse<{
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