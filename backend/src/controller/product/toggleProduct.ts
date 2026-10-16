import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from 'express'

export async function toggleProduct(req: AuthRequest, res: Response<ToggleProductResponse>) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    const toggledProduct = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: { isActive: !product.isActive }
    })

    logger.info("Product toggled", { productId: toggledProduct.id, isActive: product.isActive, toggledBy: req.user?.userId })

    return res.status(201).json({
      success: true,
      message: `Product ${toggledProduct.isActive ? "Activated" : "Deactivated"}`,
      data: {
        id: toggledProduct.id,
        name: toggledProduct.name
      }
    })
  } catch (error) {
    logger.error("toggleProductActive controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Failed to toggle product",
    });
  }
}

export type ToggleProductResponse = ApiResponse<{
  message: string,
  data: {
    id: string;
    name: string;
  }
}>