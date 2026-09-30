import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";

const createOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { items, userId } = req.body;

    if (!items || items.length === 0) {
      return next(new AppError("Order must contain at least one item", 400));
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((item: { productId: string }) => item.productId) },
      },
    });

    if (products.length !== items.length) {
      return next(new AppError("One or more products are invalid", 400));
    }

    let total = 0;

    const orderItems = items.map(
      (item: { productId: string; quantity: number }) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) {
          throw new AppError("Product not found", 404);
        }

        if (product.stock < item.quantity) {
          throw new AppError(`Not enough stock for ${product.name}`, 400);
        }

        total += Number(product.price) * item.quantity;

        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        };
      },
    );

    const order = await prisma.order.create({
      data: {
        total,
        user: { connect: { id: userId } },
        items: { create: orderItems },
      },
      include: { items: true },
    });
    res.status(201).json({ status: "success", data: { order } });
  },
);

const getAllOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await prisma.order.findMany();

    res.status(200).json({ status: "success", data: { orders } });
  },
);

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

const deleteOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await prisma.order.delete({ where: { id: req.params.id as string } });

    res.status(200).json({ status: "success" });
  },
);

const updateOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: { items: true },
    });

    if (!order) return next(new AppError("Order not found", 404));

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError("Order items are required", 400));
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
    });

    let total = 0;

    const orderItems = items.map((item) => {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Not enough stock for ${product.name}`, 400);
      }

      total += Number(product.price) * item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: {
          orderId: order.id,
        },
      });

      return tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          total,
          status: req.body.status,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });
    });

    res.status(200).json({
      status: "success",
      data: {
        order: updatedOrder,
      },
    });
  },
);
export { createOrder, getOrderById, getAllOrders, updateOrder, deleteOrder };
