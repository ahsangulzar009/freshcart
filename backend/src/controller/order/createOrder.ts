import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from "express"
import { Validator } from '@/validators/index'
import { OrderStatus } from "../../../prisma/generated/prisma/client";


const DELIVERY_FEE = 40
const FREE_DELIVERY_ABOVE = 500

function formatOrderNumber(orderNumber: number, createdAt: Date) {
  const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${dateStr}-${String(orderNumber)}`;
}

export async function createOrder(req: AuthRequest, res: Response<CreateOrderResponse>) {
  try {

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const customerId = req.user.userId

    const { addressId, paymentMethod, items, notes } = req.body as Validator['CreateOrder'];

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: customerId },
      select: { id: true }
    })
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]))

    let subtotal = 0;
    const orderItems: {
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product is no longer available: ${product.name}`,
        });
      }

      const unitPrice = Number(product.price);
      const itemTotal = unitPrice * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        total: itemTotal,
      });

    }

    const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const discount = 0;
    const total = subtotal + deliveryFee - discount

    const result = await prisma.$transaction(async (tx) => {

      const decremented: { productId: string; quantity: number }[] = [];

      for (const oi of orderItems) {
        const updated = await tx.product.updateMany({
          where: { id: oi.productId, stock: { gte: oi.quantity } },
          data: { stock: { decrement: oi.quantity } }
        })
        if (updated.count === 0) {
          for (const d of decremented) {
            await tx.product.update({
              where: { id: d.productId },
              data: { stock: { increment: d.quantity } },
            });
          }
          return {
            order: null,
            failedProductId: oi.productId,
          };
        }

        decremented.push({ productId: oi.productId, quantity: oi.quantity });
      }

      const order = await tx.order.create({
        data: {
          customerId,
          addressId,
          paymentMethod,
          subtotal,
          deliveryFee,
          discount,
          total,
          notes,
          items: { create: orderItems },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              note: "Order Placed",
              changedBy: customerId,
            },
          },
          tracking: { create: {} },
        },
        include: { items: true },
      })

      return { order, failedProductId: null };
    })

    if (!result.order) {
      const failed = productMap.get(result.failedProductId);
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for: ${failed?.name ?? "a product"}`,
      });
    }

    const order = result.order;
    logger.info("Order placed", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
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
        customerId: order.customerId,
        addressId: order.addressId,
        items: order.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          unitPrice: i.unitPrice.toString(),
          total: i.total.toString(),
        })),
      },
    });


  } catch (error) {
    logger.error("createOrder controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while creating an order"
    })
  }
}

export type CreateOrderResponse = ApiResponse<{
  message: string;
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
    customerId: string;
    addressId: string;
    items: {
      id: string;
      quantity: number;
      unitPrice: string;
      total: string;
    }[]
  }
}>