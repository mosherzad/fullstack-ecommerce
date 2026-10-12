import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { Request, Response, NextFunction } from "express";

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
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

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      select: { id: true },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId: req.params.id as string,
        userId: req.user!.userId,
      },
    });
    res.status(201).json({ status: "success", data: { review } });
  },
);

const updateReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const selectedReview = await prisma.review.findUnique({
      where: { id: req.params.reviewId as string },
    });

    if (!selectedReview) {
      return next(new AppError("Review not found", 404));
    }

    if (req.user!.userId !== selectedReview.userId) {
      return next(new AppError("Access denied", 403));
    }

    const review = await prisma.review.update({
      where: { id: selectedReview.id },
      data: req.body,
    });

    res.status(200).json({ message: "success", data: { review } });
  },
);

const getReviewById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await prisma.review.findUnique({
      where: { id: req.params.reviewId as string },
      include: {
        user: {
          select: { id: true, name: true },
        },
        product: {
          select: { id: true, name: true },
        },
      },
    });

    if (!review) return next(new AppError("Review not found", 404));

    res.status(200).json({ message: "success", data: { review } });
  },
);

const deleteReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const selectedReview = await prisma.review.findUnique({
      where: { id: req.params.reviewId as string },
    });

    if (!selectedReview) {
      return next(new AppError("Review not found", 404));
    }

    if (req.user!.userId !== selectedReview.userId) {
      return next(new AppError("Access denied", 403));
    }

    await prisma.review.delete({
      where: { id: req.params.reviewId as string },
    });

    res.status(200).json({ message: "success" });
  },
);

export {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
};
