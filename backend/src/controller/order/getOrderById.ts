import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from "express"

function formatOrderNumber(orderNumber: number, createdAt: Date) {
  const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${dateStr}-${String(orderNumber)}`;
}

export async function getOrderById(req: AuthRequest, res: Response<GetOrderByIdResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;
    const role = req.user.role;
    const orderId = String(req.params.id)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        deliveryPartnerId: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        subtotal: true,
        deliveryFee: true,
        discount: true,
        total: true,
        notes: true,
        cancelledAt: true,
        createdAt: true,
        cancelReason: true,
        estimatedAt: true,
        deliveredAt: true,
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        deliveryPartner: {
          select: { id: true, name: true, email: true, phone: true }
        },
        statusHistory: {
          select: { id: true, status: true, note: true, createdAt: true },
          orderBy: { createdAt: "desc" }
        },
        address: {
          select: { id: true, label: true, line1: true, line2: true, city: true, state: true, pincode: true }
        },
        items: {
          select: {
            id: true, quantity: true, unitPrice: true, total: true,
            product: {
              select: { id: true, name: true, imageUrl: true, unit: true },
            },
          },
        },
      }
    })

    const isOwner =
      role === "ADMIN" ||
      (role === "CUSTOMER" && order?.customerId === userId) ||
      (role === "DELIVERY_PARTNER" && order?.deliveryPartnerId === userId);

    if (!order || !isOwner) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const data = {
      id: order.id,
      orderNumber: formatOrderNumber(order.orderNumber, order.createdAt),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal.toString(),
      deliveryFee: order.deliveryFee.toString(),
      discount: order.discount.toString(),
      total: order.total.toString(),
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      cancelReason: order.cancelReason,
      estimatedAt: order.estimatedAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone
      },
      deliveryPartner: order.deliveryPartner
        ? {
          id: order.deliveryPartner.id,
          name: order.deliveryPartner.name,
          email: order.deliveryPartner.email,
          phone: order.deliveryPartner.phone
        }
        : null,
      statusHistory: order.statusHistory.map((ost) => ({
        id: ost.id,
        status: ost.status,
        note: ost.note,
        createdAt: ost.createdAt.toISOString()
      })),
      address: {
        id: order.address.id,
        label: order.address.label,
        line1: order.address.line1,
        line2: order.address.line2,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
      },
      items: order.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        unitPrice: i.unitPrice.toString(),
        total: i.total.toString(),
        product: {
          id: i.product.id,
          name: i.product.name,
          imageUrl: i.product.imageUrl,
          unit: i.product.unit
        }
      })),
    }

    return res.status(200).json({
      success: true,
      message: "Order Fetched",
      order: data
    })

  } catch (error) {
    logger.error("getOrderById controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during fetching your order"
    })
  }
}

export type GetOrderByIdResponse = ApiResponse<{
  message: string,
  order: {
    id: string;
    orderNumber: string;
    status: "PENDING" | "CONFIRMED" | "PREPARING" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    paymentMethod: "COD" | "ONLINE";
    subtotal: string;
    deliveryFee: string;
    discount: string;
    total: string;
    notes: string | null;
    createdAt: string;
    cancelledAt: string | null;
    cancelReason: string | null;
    estimatedAt: string | null;
    deliveredAt: string | null;
    customer: {
      id: string;
      email: string;
      name: string | null;
      phone: string | null;
    };
    deliveryPartner: {
      id: string;
      email: string;
      name: string | null;
      phone: string | null;
    } | null;
    statusHistory: {
      id: string;
      status: "PENDING" | "CONFIRMED" | "PREPARING" | "ASSIGNED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
      note: string | null;
      createdAt: string
    }[];
    address: {
      id: string;
      label: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      pincode: string;
    };
    items: {
      id: string;
      quantity: number;
      unitPrice: string;
      total: string;
      product: {
        id: string;
        name: string;
        imageUrl: string | null;
        unit: string;
      };
    }[]
  }
}>