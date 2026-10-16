import { ApiResponse } from '@/types/ApiRespnse';
import { Response, Request } from 'express'
import { prisma } from '@/config/prisma';
import { logger } from '@/utils/logger';

export async function getProductById(
  req: Request<{ id: string }>,
  res: Response<GetProductByIdResponse>
) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isActive) {

      return res.status(404).json({
        success: false,
        message: "Product is not active",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Product fetched",
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        unit: product.unit,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error("getProductById controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

export type GetProductByIdResponse = ApiResponse<{
  message: string,
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
  }
}>