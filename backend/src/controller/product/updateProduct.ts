import { prisma } from '@/config/prisma';
import { AuthRequest } from '@/middlewares/authenticate';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { Response } from 'express'
export async function updateProduct(req: AuthRequest, res: Response<UpdateProductResponse>) {
  try {
    const imageUrl = req.file ? `/backend/uploads/${req.file.filename}` : undefined;
    const productId = String(req.params.id);
    const body = req.body

    const product = await prisma.product.findUnique({
      where: { id: productId }
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

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...body,
        ...(imageUrl && { imageUrl }),
      },
    });
    logger.info("Product Updated", { productId: updatedProduct.id, updatedById: req.user?.userId, role: req.user?.role })

    return res.status(201).json({
      success: true,
      message: "Product updated",
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        price: updatedProduct.price.toString(),
        unit: updatedProduct.unit,
        stock: updatedProduct.stock,
        imageUrl: updatedProduct.imageUrl,
        isActive: updatedProduct.isActive,
        isFeatured: updatedProduct.isFeatured,
        createdAt: updatedProduct.createdAt.toISOString(),
        updatedAt: updatedProduct.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    logger.error("updateProduct controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
}

export type UpdateProductResponse = ApiResponse<{
  message: string;
  data: {
    id: string;
    name: string;
    description: string;
    category: "FRUITS" | "VEGETABLES" | "MEAT";
    price: string;
    unit: string;
    stock: number;
    imageUrl: string | null;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
  };
}>