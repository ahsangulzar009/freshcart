import { z } from "zod";


export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be atleast 2 characters").trim(),
  description: z.string().trim().optional(),
  category: z.enum(["FRUITS", "VEGETABLES", "MEAT"], { error: "Category must be Fruits, VEGETABLES, MEAT" }),
  price: z.coerce.number().positive("Price must be greater than 0"),
  unit: z.coerce.number().int().min(0, "Stock cannot be negative"),
  isFeatured: z.coerce.boolean().optional().default(false)
});

export const updateProductSchema = createProductSchema.partial()

