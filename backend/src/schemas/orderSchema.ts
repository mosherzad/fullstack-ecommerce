import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().positive("Quantity must be greater than 0"),
      }),
    )
    .min(1, "An order must contain at least one item"),
});

export const updateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "An order must contain at least one item")
    .optional(),

  status: z
    .enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
});
