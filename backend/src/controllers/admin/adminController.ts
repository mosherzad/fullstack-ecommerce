import prisma from "../../lib/prisma.js";
import { getAllProductsService } from "../../services/productServices.js";
import { catchAsync } from "../../utils/catchAsync.js";
import type { Request, Response, NextFunction } from "express";

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { total: true },
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        products: {
          total: totalProducts,
          outOfStock: outOfStockProducts,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
        },
        revenue: {
          total: revenue._sum.total ?? 0,
        },
      },
    });
  },
);
