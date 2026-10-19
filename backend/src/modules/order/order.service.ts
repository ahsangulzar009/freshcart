import { logger } from "@/utils/logger";
import { OrderStatus, PaymentMethod } from "../../../prisma/generated/prisma/client";
import productRepository from "../product/product.repository";
import orderRepository from "./order.repository";
import { getPaginationData, getPaginationParams } from "@/utils/ApiResponse";
import { stat } from "fs";
import { transporter } from "@/config/mailer";

const DELIVERY_FEE = 40
const FREE_DELIVERY_ABOVE = 500

interface CartItem {
  productId: string;
  quantity: number;
}

interface PlaceOrderInput {
  customerId: string;
  addressId: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  notes?: string
}

class OrderService {
  async placeOrder(input: PlaceOrderInput) {
    const { customerId, addressId, paymentMethod, items, notes } = input;

    if (!items || items.length === 0) {
      throw new Error("Order must have at least one item")
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productRepository.findById(item.productId)
      if (!product) {
        throw new Error(`Peoduct not found ${item.productId}`)
      }
      if (!product.isActive) {
        throw new Error(`Product is no longer available ${product.name}`)
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock far: ${product.name}`)
      }

      const unitPrice = Number(product.price)
      const itemTotal = unitPrice * item.quantity
      subtotal += itemTotal
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        total: itemTotal
      })
      const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
      const discount = 0;
      const total = subtotal + deliveryFee - discount

      const order = await orderRepository.create({
        customerId,
        addressId,
        paymentMethod,
        subtotal,
        deliveryFee,
        discount,
        total,
        notes,
        items: orderItems
      });
      for (const item of orderItems) {
        await productRepository.decrementStock(item.productId, item.quantity)
      }
      logger.info("Order placed", {
        orderId: order.id,
        orderNumer: order.orderNumber,
        customerId
      });
      return order
    }
  }

  async getCustomerOrder(customerId: string, query: Record<string, string>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const { orders, total } = await orderRepository.findByCustomer(customerId, skip, limit);
    const pagination = getPaginationData(page, limit, total)
    return { orders, pagination }
  }

  async getOrderById(id: string, userId: string, role: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found")
    }
    if (role === "CUSTOMER" && order.customerId !== userId) {
      throw new Error("Forbidden")
    }
    if (role === "DELIVERY_PARTNER" && order.deliveryPartnerId !== userId) {
      throw new Error("Forbidden")
    }

    return order
  }

  async getAllOrders(query: Record<string, string>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit)
    const status = query.status as OrderStatus | undefined;
    const { orders, total } = await orderRepository.findAll(skip, limit, status);
    const pagination = getPaginationData(page, limit, total)

    return { orders, pagination }
  }

  private async sendStatusMail(email: string, orderNumber: string, status: OrderStatus) {
    const statusMessage: Partial<Record<OrderStatus, string>> = {
      [OrderStatus.CONFIRMED]: "Your order has been confirmed and is being prepared.",
      [OrderStatus.OUT_FOR_DELIVERY]: "Your order is out for delivery!",
      [OrderStatus.DELIVERED]: "Your order has been delivered. Enjoy!",
      [OrderStatus.CANCELLED]: "Your order has been cancelled."
    }

    const message = statusMessage[status]
    if (!message) return;

    try {
      await transporter.sendMail({
        from: `Freshcart <${process.env.SMTP_FROM}>`,
        to: email,
        subject: `Order ${orderNumber} - ${status.replace(/_/g, "")}`,
        html:`
          <div style="font-family: sans-serif; max-width:480px; margin:0 auto">
            <h2>Order Update</h2>
            <p>Order: <string>${orderNumber}</strong></p>
            <p>${message}</p
          </div
        `
      })
    } catch (error) {
      logger.error("Failed to send order status email", { email, orderNumber, status, error })
    }
  }
}

export default new OrderService