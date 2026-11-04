import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import {
  addToCartServices,
  clearCartServices,
  getCartServices,
  removeFromCartServices,
  updateCartItemServices,
} from "../services/cartServices.js";

export const addToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, quantity } = req.body;
    const userId = req.user!.userId;

    const cartItem = await addToCartServices(userId, productId, quantity);

    res.status(200).json({
      status: "success",
      data: { cartItem },
    });
  },
);

export const getCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user!;

    const cart = await getCartServices(userId);

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
    const { productId } = req.params;
    const { userId } = req.user!;
    const cartItem = await updateCartItemServices(
      userId,
      productId as string,
      quantity,
    );

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
    const { productId } = req.params;
    const { userId } = req.user!;

    await removeFromCartServices(userId, productId as string);

    res.status(200).json({
      status: "success",
    });
  },
);

export const clearCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user!;

    await clearCartServices(userId);

    res.status(200).json({
      status: "success",
    });
  },
);
