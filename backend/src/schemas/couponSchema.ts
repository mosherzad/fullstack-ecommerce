import { z } from "zod";

const couponBaseSchema = z.object({
  code: z.string().trim().min(3).max(20).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

const updateCouponBaseSchema = couponBaseSchema.partial();

const validateCoupon = (
  data: {
    discountType?: "PERCENTAGE" | "FIXED" | undefined;
    discountValue?: number | undefined;
    startsAt?: Date | undefined;
    expiresAt?: Date | undefined;
  },
  ctx: z.RefinementCtx,
) => {
  if (
    data.discountType === "PERCENTAGE" &&
    data.discountValue !== undefined &&
    data.discountValue > 100
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["discountValue"],
      message: "Percentage discount cannot exceed 100%",
    });
  }

  if (data.startsAt && data.expiresAt && data.expiresAt <= data.startsAt) {
    ctx.addIssue({
      code: "custom",
      path: ["expiresAt"],
      message: "Expiration date must be after the start date",
    });
  }
};

export const createCouponSchema = couponBaseSchema.superRefine(validateCoupon);

export const updateCouponSchema =
  updateCouponBaseSchema.superRefine(validateCoupon);
