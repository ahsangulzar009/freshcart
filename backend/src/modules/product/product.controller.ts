import { AuthRequest } from "@/middlewares/authenticate";
import { Response, Request } from 'express'
import productService from "./product.service";
import { ApiResponse, sendPaginated } from "@/utils/ApiResponse";
import { logger } from "@/utils/logger";

class ProductsController {
  async createProduct(req: AuthRequest, res: Response) {
    try {
      const imageUrl = req.file ? `/backend/uploads/${req.file.filename}` : undefined;
      const product = await productService.createProduct({ ...req.body, imageUrl });

      ApiResponse(res, true, "Product created successfully", 201, product)
    } catch (error) {
      logger.error("createProduct controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async getProducts(req: Request, res: Response) {
    try {
      const { products, pagination } = await productService.getProducts(
        req.query as Record<string, string>
      )

      sendPaginated(res, "Products fetch", products, pagination)
    } catch (error) {
      logger.error("getProducts controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async getFeaturedProducts(_req: Request, res: Response) {
    try {
      const products = await productService.getFeaturedProducts();
      ApiResponse(res, false, "Featured products fetched", 200, products)
    } catch (error) {
      logger.error("getFeaturedProducts controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(String(req.params.id))
      ApiResponse(res, true, "Product fetched", 200, product)
    } catch (error) {
      logger.error("getProductById controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 404)
    }
  }

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      const imageUrl = req.file ? `/backend/uploads/${req.file.filename}` : undefined;
      const product = await productService.updateProduct(String(req.params.id), { ...req.body, imageUrl });

      ApiResponse(res, true, "Product updated successfully", 200, product)
    } catch (error) {
      logger.error("updateProduct controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const result = await productService.deleteProduct(String(req.params.id))
      ApiResponse(res, true, result.message, 200)
    } catch (error) {
      logger.error("deleteProduct controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async toggleProductActive(req: AuthRequest, res: Response) {
    try {
      const product = await productService.toggleProductActive(String(req.params.id))
      ApiResponse(res, true, `Product ${product.isActive ? "Activated" : "Deactivated"}`, 200, product)
    } catch (error) {
      logger.error("toggleProductActive controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

}

export default new ProductsController