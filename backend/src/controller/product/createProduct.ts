import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from 'express'

export async function createProduct(req: AuthRequest, res: Response<CreateProductResponse>) {
  try {
    const imageUrl = req.file ? `/backend/uploads/${req.file.filename}` : undefined;
    const body = req.body

    const product = await prisma.product.create({ data: { ...body, imageUrl } })
    logger.info("Product Created", {
      productId: product.id,
      name: product.name
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
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
        createdAt: product.createdAt.toISOString()
      }
    })
  } catch (error) {
    logger.error("createProduct controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during creating product"
    })
  }
}

export type CreateProductResponse = ApiResponse<{
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
  }
}>