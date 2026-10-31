import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { Prisma } from "../generated/prisma/client.js";

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const {
    categoryName,
    minPrice,
    maxPrice,
    search,
    sort,
    page = "1",
    limit = "10",
  } = req.query;

  const currentPage = Number(page);
  const pageSize = Number(limit);

  let offset = (currentPage - 1) * pageSize;

  const defaultSort: Prisma.ProductOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const sortOptions: Record<string, Prisma.ProductOrderByWithRelationInput> = {
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
  };

  const orderBy = sortOptions[String(sort)] ?? defaultSort;

  const filter: any = {};

  if (search) {
    filter.OR = [
      {
        name: {
          contains: String(search),
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: String(search),
          mode: "insensitive",
        },
      },
    ];
  }
  if (typeof categoryName === "string" && categoryName) {
    filter.category = {
      name: {
        equals: String(categoryName),
        mode: "insensitive",
      },
    };
  }

  if (maxPrice || minPrice) {
    filter.price = {};
    if (minPrice) filter.price.gte = Number(minPrice);
    if (maxPrice) filter.price.lte = Number(maxPrice);
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: filter,
      include: {
        category: { select: { name: true } },
      },
      orderBy,
      skip: offset,
      take: pageSize,
    }),
    prisma.product.count({ where: filter }),
  ]);

  const productIds = products.map((product) => product.id);

  const reviewStats = productIds.length
    ? await prisma.review.groupBy({
        by: ["productId"],
        where: {
          productId: { in: productIds },
        },
        _avg: { rating: true },
        _count: {
          _all: true,
        },
      })
    : [];

  const productsWithRating = products.map((product) => {
    const stats = reviewStats.find((item) => item.productId === product.id);

    const average = stats?._avg.rating;

    return {
      ...product,
      averageRating: average == null ? null : Number(average.toFixed(2)),
      reviewCount: stats?._count._all ?? 0,
    };
  });

  res.status(200).json({
    status: "success",
    results: products.length,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    data: { productsWithRating },
  });
});

const getProductById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      include: { reviews: true },
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
