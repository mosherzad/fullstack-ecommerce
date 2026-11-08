import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";

export const validateCouponService = async (code: string, subtotal: number) => {
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) throw new AppError("Coupon not found", 404);

  if (coupon.startsAt && coupon.startsAt > new Date()) {
    throw new AppError("Coupon is not available yet", 400);
  }

  if (coupon.expiresAt && coupon.expiresAt <= new Date()) {
    throw new AppError("Coupon is expired", 400);
  }

  if (!coupon.isActive) {
    throw new AppError("Coupon is inactive", 400);
  }

  if (coupon.usageLimit !== null && coupon.usageLimit <= coupon.usedCount) {
    throw new AppError("Coupon usage limit reached", 400);
  }

  if (
    coupon.minOrderAmount !== null &&
    subtotal < Number(coupon.minOrderAmount)
  ) {
    throw new AppError("Minimum order amount not reached", 400);
  }

  let discountAmount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (subtotal * Number(coupon.discountValue)) / 100;

    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    }
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    ...coupon,
    discountAmount,
  };
};
