import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import prisma from "../lib/prisma.js";

export const addToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, quantity } = req.body;
    const userId = req.user!.userId;

    const cartItem = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const cart = await tx.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      const totalQuantity = (existingItem?.quantity ?? 0) + quantity;

      if (totalQuantity > product.stock) {
        throw new AppError("Quantity exceeds available stock", 400);
      }

      return tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    });

    res.status(200).json({
      status: "success",
      data: { cartItem },
    });
  },
);

export const getCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.userId },
      include: { items: true },
    });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        cart,
      },
    });
  },
);

export const updateCartItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { quantity } = req.body;
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.productId as string },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    if (quantity > product.stock) {
      return next(new AppError("Quantity exceeds available stock", 400));
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: req.params.productId as string,
        },
      },
      data: {
        quantity,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        cartItem,
      },
    });
  },
);

export const removeCartItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: req.params.productId as string,
        },
      },
    });

    res.status(200).json({
      status: "success",
    });
  },
);

export const clearCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    res.status(200).json({
      status: "success",
    });
  },
);
