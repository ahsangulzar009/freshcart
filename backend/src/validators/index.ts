import { logoutSchema, refreshTokenSchema, sentOtpSchema, verifyOtpSchema } from "./auth.validation";
import { createProductSchema, updateProductSchema } from "./product.validation";

export const validator = {
  sentOtpSchema: sentOtpSchema,
  verifyOtpSchema: verifyOtpSchema,
  refreshTokenSchema: refreshTokenSchema,
  logoutSchema: logoutSchema,
  createProductSchema: createProductSchema,
  updateProductSchema: updateProductSchema
}
