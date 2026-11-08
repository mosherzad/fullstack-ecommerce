import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z
      .string("Name should be a string")
      .trim()
      .min(3, "Name should be at least 3 characters")
      .max(50, "Name should not exceed 50 characters"),

    phone: z
      .string("Phone should be a string")
      .min(7, "Phone number is invalid")
      .max(20, "Phone number is invalid"),

    city: z
      .string("City should be a string")
      .trim()
      .min(2, "City is required")
      .max(50, "City name is too long"),

    address: z
      .string("Address should be a string")
      .trim()
      .min(3, "Address should be at least 2 characters")
      .max(200, "Address is too long"),
  }),

  paymentMethod: z.enum(["COD", "STRIPE"], {
    error: "Invalid payment method",
  }),
  code: z.string().optional(),
});

export const updateOrderSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
});
