import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("Category name is required")
    .trim()
    .min(3, "Category name must be at least 3 characters")
    .max(12, "Category name must not exceed 12 characters"),

  image: z.string().trim().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
