import prisma from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";
import type { Request, Response, NextFunction } from "express";

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json({ status: "success", data: { reviews } });
});
