import z from "zod";

export const createProductSchema = z.object({
  name: z.string("Product Name is required").min(3),
  description: z.string().optional(),
  price: z.number("Product Price is required").positive(),
  stock: z.number("Product Stock is required").int().nonnegative(),
  categoryId: z.string("Select category please"),
  image: z.file().optional(),
});

export const updateProductSchema = createProductSchema.partial();
