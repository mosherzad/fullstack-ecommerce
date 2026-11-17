import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string("Product Name is required")
    .min(3, "The product name should be at least 3 charachters"),
  description: z.string().optional(),
  price: z.number("Product Price is required").positive(),
  stock: z.number("Product Stock is required").int().nonnegative(),
  categoryId: z.string("Select category please"),
  image: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();
