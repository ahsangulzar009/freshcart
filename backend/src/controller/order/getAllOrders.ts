import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { Response } from "express"
import { OrderStatus } from "../../../prisma/generated/prisma/client";
import { logger } from "@/utils/logger";

function formatOrderNumber(orderNumber: number, createdAt: Date) {
  const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${dateStr}-${String(orderNumber)}`;
}

export async function getAllOrders(req: AuthRequest, res: Response<GetAllOrdersResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const query = req.query as { page?: string; limit?: string; status?: string };
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;
    const status = query.status as OrderStatus | undefined

    const where = { ...(status && { status: status }) };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
            }
          },
          tracking: {
            select: {
              id: true,
              customerLatitude: true,
              customerLongitude: true,
              partnerLatitude: true,
              partnerLongitude: true,
              storeLatitude: true,
              storeLongitude: true
            }
          }
        }
      }),

      prisma.order.count({ where })

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
      estimatedAt: o.estimatedAt?.toISOString() ?? null,
      deliveredAt: o.deliveredAt?.toISOString() ?? null,
      customer: {
        id: o.customer.id,
        name: o.customer.name,
        email: o.customer.email,
        phone: o.customer.phone
      },
      deliveryPartner: o.deliveryPartner
        ? {
          id: o.deliveryPartner.id,
          name: o.deliveryPartner.name,
          email: o.deliveryPartner.email,
          phone: o.deliveryPartner.phone
        }
        : null,
      statusHistory: o.statusHistory.map((ost) => ({
        id: ost.id,
        status: ost.status,
        note: ost.note,
        createdAt: ost.createdAt.toISOString()
      })),
      address: {
        id: o.address.id,
        label: o.address.label,
        line1: o.address.line1,
        line2: o.address.line2,
        city: o.address.city,
        state: o.address.state,
        pincode: o.address.pincode,
      },
      items: o.items.map((i) => ({
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
      tracking: o.tracking ? {
        id: o.tracking.id,
        partnerLatitude: o.tracking.partnerLatitude,
        partnerLongitude: o.tracking.partnerLongitude,
        storeLatitude: o.tracking.storeLatitude,
        storeLongitude: o.tracking.storeLongitude,
        customerLatitude: o.tracking.customerLatitude,
        customerLongitude: o.tracking.customerLongitude
      } : null
    }))

    return res.status(200).json({
      success: true,
      message: "All Orders fetched",
      orders: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })

  } catch (error) {
    logger.error("getAllOrderscontroller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during fetching all orders"
    })
  }
}

export type GetAllOrdersResponse = ApiResponse<{
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
      createdAt: string;
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
    }[];
    tracking: {
      id: string;
      partnerLatitude: number | null;
      partnerLongitude: number | null;
      storeLatitude: number;
      storeLongitude: number;
      customerLatitude: number | null;
      customerLongitude: number | null;
    } | null;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}>;