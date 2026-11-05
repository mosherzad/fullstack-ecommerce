import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";

export const getCartServices = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  return cart;
};
export const addToCartServices = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
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

  return cartItem;
};

export const updateCartItemServices = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (quantity > product.stock) {
    throw new AppError("Quantity exceeds available stock", 400);
  }

  const cartItem = await prisma.cartItem.update({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    data: {
      quantity,
    },
  });

  return cartItem;
};

export const removeFromCartServices = async (
  userId: string,
  productId: string,
) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  await prisma.cartItem.delete({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });
};

export const clearCartServices = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });
};
