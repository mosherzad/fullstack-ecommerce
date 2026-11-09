import type { PaymentMethod, Prisma } from "../generated/prisma/browser.js";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import { validateCouponService } from "./validateCouponServices.js";

type CheckoutData = {
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  paymentMethod: PaymentMethod;
  code?: string;
};

export const getAllOrdersService = async (
  status?: string,
  page: number = 1,
  limit: number = 10,
  sort: string = "createdAt_desc",
) => {
  const sortOptions: Record<string, Prisma.OrderOrderByWithRelationInput> = {
    createdAt_asc: { createdAt: "asc" },
    createdAt_desc: { createdAt: "desc" },
    total_asc: { total: "asc" },
    total_desc: { total: "desc" },
  };

  const orderBy = sortOptions[sort as string] || { createdAt: "desc" };
  const offset = (Number(page) - 1) * Number(limit);
  const where: Prisma.OrderWhereInput = {};

  if (status && typeof status === "string") {
    where.status = status as Prisma.EnumOrderStatusFilter<"Order">;
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy,
      skip: offset,
      take: Number(limit),
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  return {
    orders,
    total,
    limit: Number(limit),
    totalPages,
    page: Number(page),
  };
};

export const createOrderService = async (
  items: { productId: string; quantity: number }[],
  userId: string,
  checkout: CheckoutData,
  tx: Prisma.TransactionClient,
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Order must contain at least one item", 400);
  }

  const productIds = items.map((item) => item.productId);

  if (new Set(productIds).size !== productIds.length) {
    throw new AppError("Duplicate products are not allowed", 400);
  }

  const products = await tx.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  if (products.length !== productIds.length) {
    throw new AppError("One or more products are invalid", 400);
  }

  let subtotal = 0;
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

    subtotal += Number(product.price) * item.quantity;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  let coupon;
  if (checkout.code) {
    const selectedCoupon = await tx.coupon.findUnique({
      where: { code: checkout.code },
    });

    if (!selectedCoupon) {
      throw new AppError("Coupon nou found", 404);
    }

    coupon = await validateCouponService(selectedCoupon.code, subtotal);

    const updatedCoupon = await tx.coupon.updateMany({
      where: {
        id: selectedCoupon.id,
        ...(selectedCoupon.usageLimit !== null
          ? { usedCount: { lt: selectedCoupon.usageLimit } }
          : {}),
      },
      data: {
        usedCount: { increment: 1 },
      },
    });

    if (updatedCoupon.count === 0) {
      throw new AppError("Coupon usage limit has been reached", 400);
    }
  }

  const discountAmount = coupon?.discountAmount ?? 0;
  const finalTotal = subtotal - Number(discountAmount);

  return tx.order.create({
    data: {
      subtotal,
      discountAmount,
      total: finalTotal,
      couponId: coupon?.id ?? null,
      userId,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      items: {
        create: orderItems,
      },
    },
    select: {
      id: true,
      userId: true,
      subtotal: true,
      discountAmount: true,
      total: true,
      status: true,
      paymentMethod: true,
      items: true,
    },
  });
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
        throw new AppError("You can only cancel your orders", 400);
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
