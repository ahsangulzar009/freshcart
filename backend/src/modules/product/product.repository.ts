import { prisma } from "@/config/prisma";
import { CreateProductInput, GetProductsFilter, UpdateProductInput } from "./types/product.types";



export class ProductRepository {
  create(data: CreateProductInput) {
    return prisma.product.create({ data })
  }

  async findAll(filter: GetProductsFilter) {
    const { category, isActive, isFeatured, search, skip, limit } = filter;

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

    return { products, total }
  }

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id }
    })
  }

  findFeatured() {
    return prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  update(id: string, data: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data })
  }

  delete(id: string) {
    return prisma.product.delete({ where: { id } })
  }

  decrementStock(id: string, quantity: number) {
    return prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } }
    })
  }

  incrementStock(id: string, quantity: number) {
    return prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } }
    })
  }

}

export default new ProductRepository