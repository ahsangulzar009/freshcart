import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().trim().optional().default("Home"),
  line1: z.string().min(5, "Address Line1 must be atleast 5 characters").trim(),
  line2: z.string().trim().optional(),
  city: z.string().min(2, "City is required").trim(),
  state: z.string().min(2, "State is required").trim(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional()
})

export const updateAddressSchema = createAddressSchema.partial()