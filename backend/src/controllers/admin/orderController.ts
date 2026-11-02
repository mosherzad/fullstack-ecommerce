import { catchAsync } from "../../utils/catchAsync.js";
import type { Request, Response, NextFunction } from "express";
import { getAllOrdersService } from "../../services/orderServices.js";

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
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
