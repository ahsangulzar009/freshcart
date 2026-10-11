import { logger } from "@/utils/logger";
import productRepository from "./product.repository";
import { CreateProductInput, GetProductQuery, UpdateProductInput } from "./types/product.types";
import { getPaginationData, getPaginationParams } from "@/utils/ApiResponse";
import { ProductCategory } from "../../../prisma/generated/prisma/client";

class ProductService {
  async createProduct(data: CreateProductInput) {
    const product = await productRepository.create(data)

    logger.info("Product Created", {
      productId: product.id,
      name: product.name
    });

    return product
  }

  async getProducts(query: GetProductQuery) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const category = query.category as ProductCategory | undefined;
    const isFeatured = query.featured === "true" ? true : undefined

    const { products, total } = await productRepository.findAll({
      category,
      isActive: true,
      isFeatured,
      search: query.search,
      skip,
      limit
    });

    const pagination = getPaginationData(page, limit, total)

    logger.info("Products fetched", { total, page, limit });

    return { products, pagination }
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found")
    }

    return product
  }

  async getFeaturedProducts() {
    return productRepository.findFeatured();
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error("Product not found")
    }

    const product = await productRepository.update(id, data)
    logger.info("Product Updated", { productId: id })

    return product
  }

  async deleteProduct(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error("Product not found")
    }

    await productRepository.delete(id)
    logger.info("Product deleted", { productId: id })

    return { message: "Product deleted successfully" }
  }

  async toggleProductActive(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error("Product not found")
    };

    const product = await productRepository.update(id, {
      isActive: !existing.isActive
    })

    logger.info("Product toggled", { productId: id, isActive: product.isActive })

    return product
  }

}

export default new ProductService