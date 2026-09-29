import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id as string,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return next(new AppError("Record not found", 404));

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  },
);

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await prisma.user.delete({
    where: {
      id: req.params.id as string,
    },
  });

  res.status(204).json({ status: "success" });
});
