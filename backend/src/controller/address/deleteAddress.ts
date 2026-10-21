import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from 'express'

export async function deleteAddresses(req: AuthRequest, res: Response<DeleteAddressesResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;
    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
      return res.status(400).json({
        success: false,
        message: "Address is required"
      });
    }

    const uniqueIds = [...new Set(ids as string[])]

    const deletedCount = await prisma.$transaction(async (tx) => {
      const { count } = await tx.address.deleteMany({
        where: { id: { in: uniqueIds }, userId }
      });
      if (count === 0) return 0;

      const hasDefault = await tx.address.findFirst({
        where: { userId, isDefault: true },
        select: { id: true }
      })

      if (!hasDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: { id: true }
        });
        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true }
          });
        }
      }

      return count
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No addresses found to delete"
      });
    }
    logger.info("Addresses Deleted", { userId, deletedCount, ids: uniqueIds });

    return res.status(200).json({
      success: true,
      message: `${deletedCount} ${deletedCount === 1 ? 'address' : 'addresses'} deleted successfully!`
    });

  } catch (error) {
    logger.error("deleteAddresses controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for deleting your addresses"
    });
  }
}

export type DeleteAddressesResponse = ApiResponse<{
  message: string
}>