import { prisma } from '@/config/prisma';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { Response, Request } from 'express'

export async function getFeaturedProducts(req: Request, res: Response<GetFeaturedProductsResponse>) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({
      success: true,
      message: "Featured products fetched",
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price.toString(),
        unit: p.unit,
        stock: p.stock,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error("getFeaturedProducts controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    });
  }
}

export type GetFeaturedProductsResponse = ApiResponse<{
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
    createdAt: string;
    updatedAt: string
  }[]
}>
