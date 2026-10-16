import { ApiResponse } from '@/types/ApiRespnse';
import { Response, Request } from 'express'
import { ProductCategory } from '../../../prisma/generated/prisma/client';
import { prisma } from '@/config/prisma';
import { logger } from '@/utils/logger';

export async function getProducts(req: Request, res: Response<GetProductsResponse>) {
  try {
    const query = req.query as Record<string, string>

    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const category = query.category as ProductCategory | undefined;
    const isFeatured = query.featured === "true" ? true : undefined

    const { search } = query;
    const isActive =
      query.isActive === "true" ? true :
        query.isActive === "false" ? false :
          undefined;

    const where = {
      ...(category && { category }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(search && { name: { contains: search, mode: "insensitive" as const } })
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    logger.info("Products fetched", { total, page, limit });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched",
      data: products.map((p) => ({
        ...p,
        price: p.price.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    logger.error("getProducts controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during fetching products"
    })
  }
}

export type GetProductsResponse = ApiResponse<{
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
  }[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean
  }
}>