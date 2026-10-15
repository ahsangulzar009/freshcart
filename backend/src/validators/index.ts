import { sentOtpSchema, verifyOtpSchema } from "./auth.validation";
import { createProductSchema, updateProductSchema } from "./product.validation";

export const validator = {
  sentOtpSchema: sentOtpSchema,
  verifyOtpSchema: verifyOtpSchema,
  createProductSchema: createProductSchema,
  updateProductSchema: updateProductSchema
}
