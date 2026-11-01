import z from "zod";
export const getAllProductsSchema = z
  .object({
    search: z.string().trim().optional(),

    categoryName: z.string().trim().optional(),

    minPrice: z.coerce
      .number({ message: "Minimum price must be a valid number" })
      .min(0, "Minimum price cannot be negative")
      .optional(),

    maxPrice: z.coerce
      .number({ message: "Maximum price must be a valid number" })
      .min(0, "Maximum price cannot be negative")
      .optional(),

    sort: z
      .enum(
        [
          "price_asc",
          "price_desc",
          "newest",
          "oldest",
          "name_asc",
          "name_desc",
        ],
        {
          message: "Invalid sorting option",
        },
      )
      .default("newest"),

    page: z.coerce
      .number({ message: "Page must be a valid number" })
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .default(1),

    limit: z.coerce
      .number({ message: "Limit must be a valid number" })
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot exceed maximum price",
      path: ["minPrice"],
    },
  );

export const getAllOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(10),

  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),

  sort: z
    .enum(["createdAt_asc", "createdAt_desc", "total_asc", "total_desc"])
    .default("createdAt_desc"),
});
