import { z } from "zod";

export const sentOtpSchema = z.object({
  email: z.email("Invalid email address").toLowerCase().trim()
})

export const verifyOtpSchema = z.object({
  email: z.email("Invalid email address").toLowerCase().trim(), 
  code: z.string().length(6, "OTP must be 6 digit").regex(/^\d+$/, "OTP must contain number")
})

