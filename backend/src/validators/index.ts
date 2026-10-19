import { createAddressSchema, updateAddressSchema } from "./address.validation";
import { sentOtpSchema, verifyOtpSchema } from "./auth.validation";
import { assignDeliveryPartnerSchema, placeOrderSchema, updateOrderStatusSchema, updateTrackingSchema } from "./orders.validation";
import { createProductSchema, updateProductSchema } from "./product.validation";

export const validator = {
  sentOtpSchema: sentOtpSchema,
  verifyOtpSchema: verifyOtpSchema,
  createProductSchema: createProductSchema,
  updateProductSchema: updateProductSchema,
  createAddressSchema: createAddressSchema,
  updateAddressSchema: updateAddressSchema,
  placeOrderSchema: placeOrderSchema,
  updateOrderStatusSchema: updateOrderStatusSchema,
  assignDeliveryPartnerSchema: assignDeliveryPartnerSchema,
  updateTrackingSchema: updateTrackingSchema
}
