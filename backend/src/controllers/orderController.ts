import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import {
  createOrderService,
  updateOrderStatusService,
} from "../services/orderServices.js";
import {
  sendOrderCancelledEmail,
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
  sendOrderShippedEmail,
} from "../services/orderEmailServices.js";

// const createOrder = catchAsync(async (req: Request, res: Response) => {
//   const order = await createOrderService(req.body.items, req.user!.userId);

//   res.status(201).json({
//     status: "success",
//     data: { order },
//   });
// });

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
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

  res.status(200).json({ status: "success", data: { orders } });
});

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

  if (!updatedOrder) {
    throw new AppError("Order not found", 404);
  }

  const orderOwner = await prisma.user.findUnique({
    where: { id: updatedOrder.userId },
    select: { email: true },
  });

  if (!orderOwner) {
    throw new AppError("User not found", 404);
  }

  if (updatedOrder) {
    const orderEmailData = {
      id: updatedOrder.id,
      status: updatedOrder.status,
      discountAmount: Number(updatedOrder.discountAmount),
      subtotal: Number(updatedOrder.subtotal),
      total: Number(updatedOrder.total),
    };

    try {
      if (updatedOrder.status === "SHIPPED") {
        await sendOrderShippedEmail(orderOwner.email, orderEmailData);
      } else if (updatedOrder.status === "DELIVERED") {
        await sendOrderDeliveredEmail(orderOwner.email, orderEmailData);
      } else if (updatedOrder.status === "CANCELLED") {
        await sendOrderCancelledEmail(orderOwner.email, orderEmailData);
      }
    } catch (error) {
      console.error("Failed to send order status email:", error);
    }
  }
  res.status(200).json({
    status: "success",
    data: { order: updatedOrder },
  });
});

const checkout = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { shippingAddress, paymentMethod, code } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
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
});

export { getMyOrders, updateOrderStatus, deleteOrder, checkout };
