import { ProductCategory } from "../../../../prisma/generated/prisma/client";

export interface CreateProductInput {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock: number;
  imageUrl?: string;
  isFeatured?: boolean
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface GetProductsFilter {
  category?: ProductCategory;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  skip: number;
  limit: number;
}

export interface GetProductQuery {
  category?: ProductCategory;
  search?: string;
  featured?: string;
  page?: string
  limit?: string;
}