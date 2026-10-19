import { prisma } from "@/config/prisma";
import { OrderStatus, PaymentMethod } from "../../../prisma/generated/prisma/client";

interface CreateOrderInput {
  customerId: string;
  addressId: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[]
}

export class OrderRepository {
  async generateOrderNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.order.count();
    return `ORD-${dateStr}-${String(count + 1).padStart(4, "0")}`
  }

  async create(data: CreateOrderInput) {
    const orderNumber = await this.generateOrderNumber();

    return prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        addressId: data.addressId,
        paymentMethod: data.paymentMethod,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        discount: data.discount,
        total: data.total,
        notes: data.notes,
        items: {
          create: data.items
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            note: "Order Placed",
            changedBy: data.customerId
          },
        },
        tracking: {
          create: {}
        },
      },
      include: {
        items: { include: { product: true } },
        address: true,
        statusHistory: true
      }
    })
  }

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        address: true,
        customer: {
          select: { id: true, email: true, name: true, phone: true }
        },
        deliveryPartner: {
          select: { id: true, email: true, name: true, phone: true }
        },
        statusHistory: { orderBy: { createdAt: "desc" } },
        tracking: true
      }
    })
  }

  async findByCustomer(customerId: string, skip: number, limit: number) {
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: true } }
        }
      }),
      prisma.order.count({ where: { customerId } })
    ]);

    return { orders, total }
  }

  async findAll(skip: number, limit: number, status?: OrderStatus) {
    const where = { ...(status && { status }) };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: true } },
          address: true,
          customer: {
            select: { id: true, email: true, name: true, phone: true }
          },
          deliveryPartner: {
            select: { id: true, name: true, email: true, phone: true }
          },
          statusHistory: { orderBy: { createdAt: 'desc' } }
        }
      }),
      prisma.order.count({ where })
    ]);

    return { orders, total }
  }

  updateStatus(orderId: string, status: OrderStatus, changedBy: string, note?: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
        ...(status === OrderStatus.CANCELLED && { cancelledAt: new Date() }),
        statusHistory: {
          create: { status, note, changedBy }
        }
      },
      include: {
        items: { include: { product: true } },
        address: true,
        customer: { select: { id: true, email: true, name: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    })
  }

}

export default new OrderRepository