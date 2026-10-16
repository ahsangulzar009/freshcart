import { prisma } from '@/config/prisma';
import { AuthRequest } from '@/middlewares/authenticate';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { Response } from 'express'


export async function deleteProduct(req: AuthRequest, res: Response) {
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

    if (!product.isActive) {
      return res.status(409).json({
        success: false,
        message: "Product is not active - unable to update product"
      })
    }

    const deletedProduct = await prisma.product.delete({
      where: { id: String(req.params.id) }
    })
    logger.info("Product deleted", { productId: deletedProduct.id, deletedBy: req.user?.userId })

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    })

  } catch (error) {
    logger.error("deleteProduct controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for deleting product"
    })
  }
}

export type DeletedProductResponse = ApiResponse<{
  message: string
}>