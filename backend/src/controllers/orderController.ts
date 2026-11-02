import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import {
  createOrderService,
  updateOrderStatusService,
} from "../services/orderServices.js";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await createOrderService(req.body.items, req.user!.userId);

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

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
      },
      orderBy: { createdAt: "desc" },
    });

    if (!orders) {
      return next(new AppError("Order not found", 404));
    }
    res.status(200).json({ status: "success", data: { orders } });
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

export { createOrder, getMyOrders, updateOrderStatus, deleteOrder };
