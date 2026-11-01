import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import {
  createOrderService,
  getAllOrdersService,
  updateOrderStatusService,
} from "../services/orderServices.js";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await createOrderService(req.body.items, req.user!.userId);

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllOrdersService(
    req.query.status as string | undefined,
    Number(req.query.page) || 1,
    Number(req.query.limit) || 10,
    req.query.sort as string | undefined,
  );

  res.status(200).json({
    status: "success",
    results: result.orders.length,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.page < result.totalPages,
      hasPrevPage: result.page > 1,
    },
    data: { orders: result.orders },
  });
});

const getOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      return next(new AppError("Order not found", 404));
    }
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

export {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
