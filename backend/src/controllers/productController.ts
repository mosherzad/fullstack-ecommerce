import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.status(200).json({ status: "success", data: { products } });
});

const getProductById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });

    if (!product) {
      return next(new AppError("Record not found", 404));
    }

    res.status(200).json({ status: "success", data: { product } });
  },
);
const addProduct = catchAsync(async (req: Request, res: Response) => {
  const newProduct = await prisma.product.create({ data: req.body });
  res.status(201).json({
    status: "success",
    data: {
      newProduct,
    },
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const updatedProduct = await prisma.product.update({
    where: { id: req.params.id as string },
    data: req.body,
  });

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: { updatedProduct },
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id as string } });

  res.status(200).json({ status: "success" });
});

export {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
