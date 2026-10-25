import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from "express"

function formatOrderNumber(orderNumber: number, createdAt: Date) {
  const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${dateStr}-${String(orderNumber)}`;
}

export async function getMyOrders(req: AuthRequest, res: Response<GetMyOrdersResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const customerId = req.user.userId
    const query = req.query as { page: string, limit: string }

    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
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
          address: {
            select: {
              id: true,
              label: true,
              line1: true,
              line2: true,
              city: true,
              state: true,
              pincode: true,
            }
          },
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              total: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  unit: true
                },
              },
            },
          },
        }
      }),

      prisma.order.count({ where: { customerId } })

    ])

    const totalPages = Math.ceil(total / limit);

    const data = orders.map((o) => ({
      id: o.id,
      orderNumber: formatOrderNumber(o.orderNumber, o.createdAt),
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal.toString(),
      deliveryFee: o.deliveryFee.toString(),
      discount: o.discount.toString(),
      total: o.total.toString(),
      notes: o.notes,
      createdAt: o.createdAt.toISOString(),
      cancelledAt: o.cancelledAt?.toISOString() ?? null,
      cancelReason: o.cancelReason,
      address:{
        id: o.address.id,
        label: o.address.label,
        line1: o.address.line1,
        line2: o.address.line2,
        city: o.address.city,
        state: o.address.state,
        pincode: o.address.pincode,
      },
      items: o.items.map((i) => ({
        ...i,
        unitPrice: i.unitPrice.toString(),
        total: i.total.toString(),
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    logger.error("getOrders controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during fetching orders"
    })
  }
}

export type GetMyOrdersResponse = ApiResponse<{
  message: string;
  orders: {
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