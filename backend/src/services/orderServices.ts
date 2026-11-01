import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";

export const createOrderService = async (
  items: { productId: string; quantity: number }[],
  userId: string,
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Order must contain at least one item", 400);
  }

  const productIds = items.map((item) => item.productId);

  if (new Set(productIds).size !== productIds.length) {
    throw new AppError("Duplicate products are not allowed", 400);
  }

  const order = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      throw new AppError("One or more products are invalid", 400);
    }

    let total = 0;

    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;

      const updated = await tx.product.updateMany({
        where: {
          id: product.id,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count === 0) {
        throw new AppError(`Not enough stock for ${product.name}`, 400);
      }

      total += Number(product.price) * item.quantity;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    return tx.order.create({
      data: {
        total,
        userId,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });
  });

  return order;
};

export const updateOrderStatusService = async (
  orderId: string,
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  userId: string,
  isAdmin: boolean,
) => {
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (!isAdmin) {
      if (order.userId !== userId) {
        throw new AppError("You can only cancel your own orders", 403);
      }

      if (status !== "CANCELLED") {
        throw new AppError("You can only cancel your orders", 403);
      }
    }

    if (order.status === "CANCELLED") {
      throw new AppError("Order is already cancelled", 400);
    }

    if (status === "CANCELLED" && order.status !== "PENDING") {
      throw new AppError("Only pending orders can be cancelled", 400);
    }

    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: order.status,
      },
      data: { status },
    });

    if (updated.count === 0) {
      throw new AppError("Order status has already changed", 400);
    }

    if (status === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    }

    return tx.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
  });

  return updatedOrder;
};
