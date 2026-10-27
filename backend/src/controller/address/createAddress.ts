import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from 'express'

export async function createAddress(req: AuthRequest, res: Response<CreateAddressResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;
    const body = req.body;

    const address = await prisma.$transaction(async (tx) => {
      const count = await tx.address.count({
        where: { userId: userId }
      });

      const isDefault = count === 0 ? true : (body.isDefault ?? false);

      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      return tx.address.create({
        data: {
          userId: userId,
          label: body.label,
          line1: body.line1,
          line2: body.line2 ?? null,
          city: body.city,
          state: body.state,
          isDefault,
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null
        }
      });
    });

    logger.info("Address Created", { addressId: address.id, userId: address.userId })

    return res.status(201).json({
      success: true,
      message: "Address Created Successfully!",
      data: {
        id: address.id,
        label: address.label,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        state: address.state,
        isDefault: address.isDefault,
        createdAt: address.createdAt.toISOString()
      }
    })


  } catch (error) {
    logger.error("createAddress controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for creating your address"
    });
  }
}

export type CreateAddressResponse = ApiResponse<{
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