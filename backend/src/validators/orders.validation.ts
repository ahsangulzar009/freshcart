import { z } from "zod";

export const placeOrderSchema = z.object({
  addressId: z.uuid("Invalid address ID"),
  paymentMethod: z.enum(["COD", "ONLINE"], { error: "Payment method must be COD or ONLINE" }),
  items: z.array(
    z.object({
      productId: z.uuid("Invalid product ID"),
      quantity: z.coerce.number().int().positive("Quanity must be at least 1")
    })
  )
    .min(1, "Order must have at least one item"),
  notes: z.string().trim().optional()
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  notes: z.string().trim().optional()
})

export const assignDeliveryPartnerSchema = z.object({
  partnerId: z.uuid("Invalid partner ID")
})

export const updateTrackingSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
})

export type CreateOrder = z.infer<typeof placeOrderSchema>