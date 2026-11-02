import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categoies = await prisma.category.findMany();

  res.status(200).json({ status: "success", data: { categoies } });
});

const getCategoryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id as string },
    });

    if (!category) return next(new AppError("Record not found", 404));

    res.status(200).json({ status: "success", data: { category } });
  },
);

export { getAllCategories, getCategoryById };
