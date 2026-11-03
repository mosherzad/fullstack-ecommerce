import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const addToWishlist = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user?.userId as string,
        productId: req.params.id as string,
      },
    });

    res.status(201).json({
      status: "success",
      data: { wishlistItem },
    });
  },
);

export const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: req.user?.userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: wishlistItems.length,
    data: { wishlistItems },
  });
});

export const removeFromWishlist = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: req.user?.userId,
        productId: req.params.id as string,
      },
    });

    if (!wishlistItem) {
      return next(new AppError("Product not found in wishlist", 404));
    }

    await prisma.wishlist.delete({
      where: { id: wishlistItem.id, userId: req.user?.userId },
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
