import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { getAllProductsService } from "../services/productServices.js";

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllProductsService(res.locals.validatedQuery);

  res.status(200).json({
    status: "success",
    results: result.products.length,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    data: { products: result.products },
  });
});

const getProductById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      include: {
        reviews: { select: { userId: true, rating: true, comment: true } },
      },
    });

    if (!product) {
      return next(new AppError("Record not found", 404));
    }

    const reviewStats = await prisma.review.aggregate({
      where: {
        productId: product.id,
      },
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    });

    const productWithRating = {
      ...product,
      averageRating:
        reviewStats._avg === null
          ? null
          : Number(reviewStats._avg.rating?.toFixed(2)),

      reviewCount: reviewStats._count._all,
    };
    res.status(200).json({ status: "success", data: { productWithRating } });
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
