import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import prisma from "../../lib/prisma.js";

export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await prisma.coupon.create({ data: req.body });

  res.status(201).json({ status: "success", data: { coupon } });
});

export const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany();

  res.status(200).json({ status: "success", data: { coupons } });
});

export const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  await prisma.coupon.delete({ where: { id: req.params.id as string } });

  res.status(200).json({ status: "success" });
});

export const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id as string },
    data: req.body,
  });

  res.status(200).json({ status: "success", data: { coupon } });
});
