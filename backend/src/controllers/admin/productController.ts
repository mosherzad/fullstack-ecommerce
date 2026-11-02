import prisma from "../../lib/prisma.js";
import { getAllProductsService } from "../../services/productServices.js";
import { catchAsync } from "../../utils/catchAsync.js";
import type { Request, Response, NextFunction } from "express";

export const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllProductsService(
      res.locals.validatedQuery,
      "ADMIN",
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);

export const addProduct = catchAsync(async (req: Request, res: Response) => {
  const newProduct = await prisma.product.create({ data: req.body });
  res.status(201).json({
    status: "success",
    data: {
      newProduct,
    },
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
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

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id as string } });

  res.status(200).json({ status: "success" });
});
