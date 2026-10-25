import { AuthRequest } from "@/middlewares/authenticate";
import { Response } from "express"
import { OrderStatus } from "../../../prisma/generated/prisma/client";
import { prisma } from "@/config/prisma";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";


function formatOrderNumber(orderNumber: number, createdAt: Date) {
  const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${dateStr}-${String(orderNumber)}`;
}

export async function updateOrderStatus(req: AuthRequest, res: Response<UpdateOrderStatusResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const role = req.user.role;
    const userId = req.user.userId;
    const orderId = String(req.params.id)
    const { status, note } = await req.body as { status: string, note?: string };

    if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const newStatus = status as OrderStatus;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, paymentMethod: true, customerId: true, deliveryPartnerId: true },
    });

    const isOwner =
      role === "ADMIN" ||
      (role === "CUSTOMER" && order?.customerId === userId) ||
      (role === "DELIVERY_PARTNER" && order?.deliveryPartnerId === userId);

    if (!order || !isOwner) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const roleAllowed: Record<string, OrderStatus[]> = {
      ADMIN: Object.values(OrderStatus),
      DELIVERY_PARTNER: ["OUT_FOR_DELIVERY"],
      CUSTOMER: ["CANCELLED"],
    };

    if (!roleAllowed[role].includes(newStatus)) {
      return res.status(403).json({ success: false, message: "You cannot set this status" });
    }

    if (role === "CUSTOMER" && !["PENDING", "CONFIRMED", "PREPARING"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order can not cancelled at this stage",
      });
    }

    const isCodDelivered =
      newStatus === OrderStatus.DELIVERED && order.paymentMethod === "COD";

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(newStatus === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
        ...(isCodDelivered && { paymentStatus: "PAID" }),
        ...(newStatus === OrderStatus.CANCELLED && { cancelledAt: new Date(), cancelReason: note ?? null }),
        statusHistory: {
          create: { status: newStatus, note, changedBy: userId },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        deliveredAt: true,
        cancelledAt: true,
        cancelReason: true,
        createdAt: true,
      },

    })

    logger.info("Order status updated", { orderId: updated.id, status: updated.status, changedBy: userId, cancelReason: updated.cancelReason, cancelledAt: updated.cancelledAt, deliveredAt: updated.deliveredAt })

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order: {
        id: updated.id,
        orderNumber: formatOrderNumber(updated.orderNumber, updated.createdAt),
        status: updated.status,
        paymentStatus: updated.paymentStatus,
        deliveredAt: updated.deliveredAt?.toISOString() ?? null,
        cancelledAt: updated.cancelledAt?.toISOString() ?? null,
        cancelReason: updated.cancelReason,
      },
    });

  } catch (error) {
    logger.error("updateOrderStatus controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during updating order status",
    });
  }
}

export type UpdateOrderStatusResponse = ApiResponse<{
  message: string;
  order: {
    id: string;
    orderNumber: string;
    status: "PENDING" | "CONFIRMED" | "PREPARING" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    deliveredAt: string | null;
    cancelledAt: string | null;
    cancelReason: string | null;
  };
}>;