import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse, sendPaginated } from "@/utils/ApiResponse";
import { logger } from "@/utils/logger";
import { Response } from "express"
import orderService from "./order.service";
import { PaymentMethod } from "../../../prisma/generated/prisma/client";

class OrderController {
  async placeOrder(req: AuthRequest, res: Response) {
    try {
      const { addressId, paymentMethod, items, notes } = req.body

      const order = await orderService.placeOrder({
        customerId: req.user!.userId,
        addressId,
        paymentMethod: paymentMethod as PaymentMethod,
        items,
        notes
      });

      ApiResponse(res, true, "Order placed successfully", 201, order)
    } catch (error) {
      logger.error("placeOrder controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const { orders, pagination } = await orderService.getCustomerOrder(
        req.user!.userId,
        req.query as Record<string, string>
      )
      sendPaginated(res, "Orders fetched", orders, pagination)
    } catch (error) {
      logger.error("getMyOrders controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const order = await orderService.getOrderById(String(req.params.id), req.user!.userId, req.user!.role);
      ApiResponse(res, true, "Order fetched", 200, order)
    } catch (error) {
      logger.error("getOrderById controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      const { orders, pagination } = await orderService.getAllOrders(req.query as Record<string, string>)
      sendPaginated(res, "Orders fetched", orders, pagination)
    } catch (error) {
      logger.error("getAllOrders controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  // async updateOrderStatus(req: AuthRequest, res: Response){
  //   try {
  //     const order = await orderService
  //   } catch (error) {
  //     logger.error("updateOrderStatus controller error", { error: (error as Error).message })
  //     ApiResponse(res, false, (error as Error).message, 500)
  //   }
  // }

}
export default new OrderController