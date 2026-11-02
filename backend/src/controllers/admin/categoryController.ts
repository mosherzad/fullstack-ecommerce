import prisma from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";
import type { Request, Response, NextFunction } from "express";

export const addCategory = catchAsync(async (req: Request, res: Response) => {
  const newCategory = await prisma.category.create({ data: req.body });

  res.status(201).json({ status: "success", data: { newCategory } });
});

export const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const updatedCategory = await prisma.category.update({
      where: { id: req.params.id as string },
      data: req.body,
    });

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: { updatedCategory },
    });
  },
);

export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    await prisma.category.delete({
      where: { id: req.params.id as string },
    });

    res.status(200).json({
      status: "success",
    });
  },
);
