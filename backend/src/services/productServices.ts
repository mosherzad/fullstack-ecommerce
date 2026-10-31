import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

type ProductQuery = {
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page: number;
  limit: number;
};

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

export const getAllProductsService = async (query: ProductQuery) => {
  const {
    categoryName,
    minPrice,
    maxPrice,
    search,
    sort = "newest",
    page,
    limit,
  } = query;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (categoryName) {
    where.category = {
      name: {
        equals: categoryName,
        mode: "insensitive",
      },
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  const orderBy = sortOptions[sort] ?? defaultSort;

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),

    prisma.product.count({ where }),
  ]);

  const productIds = products.map((product) => product.id);

  const reviewStats = productIds.length
    ? await prisma.review.groupBy({
        by: ["productId"],
        where: {
          productId: { in: productIds },
        },
        _avg: { rating: true },
        _count: { _all: true },
      })
    : [];

  const statsMap = new Map(reviewStats.map((stat) => [stat.productId, stat]));

  const productsWithRating = products.map((product) => {
    const stats = statsMap.get(product.id);
    const average = stats?._avg.rating;

    return {
      ...product,
      averageRating: average == null ? null : Number(average.toFixed(2)),
      reviewCount: stats?._count._all ?? 0,
    };
  });

  return {
    products: productsWithRating,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
