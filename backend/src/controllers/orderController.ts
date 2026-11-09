import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import {
  createOrderService,
  updateOrderStatusService,
} from "../services/orderServices.js";
import { sendOrderConfirmationEmail } from "../services/orderEmailServices.js";

// const createOrder = catchAsync(async (req: Request, res: Response) => {
//   const order = await createOrderService(req.body.items, req.user!.userId);

//   res.status(201).json({
//     status: "success",
//     data: { order },
//   });
// });

const getMyOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        _count: {
          select: { items: true },
        },
        shippingAddress: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!orders) {
      return next(new AppError("Order not found", 404));
    }
    res.status(200).json({ status: "success", data: { orders } });
  },
);

const getOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
    });

    if (!order) return next(new AppError("Order not found", 404));

    res.status(200).json({ status: "success", data: { order } });
  },
);

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  await prisma.order.delete({ where: { id: req.params.id as string } });

  res.status(200).json({ status: "success" });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const updatedOrder = await updateOrderStatusService(
    req.params.id as string,
    req.body.status as "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    req.user!.userId,
    req.user!.role === "ADMIN",
  );

  res.status(200).json({
    status: "success",
    data: { order: updatedOrder },
  });
});

const checkout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user!;
    const { shippingAddress, paymentMethod, code } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return next(new AppError("Your cart is empty", 400));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await createOrderService(
        cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        userId,
        { shippingAddress, paymentMethod, code },
        tx,
      );

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    try {
      await sendOrderConfirmationEmail(user.email, {
        id: order.id,
        status: order.status,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
      });
    } catch (error) {
      console.error("Failed to send order confirmation:", error);
    }

    res.status(201).json({
      status: "success",
      data: { order },
    });
  },
);

export { getMyOrders, getOrderById, updateOrderStatus, deleteOrder, checkout };
