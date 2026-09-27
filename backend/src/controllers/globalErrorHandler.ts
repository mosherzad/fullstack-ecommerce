import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";
import AppError from "../utils/appError.js";

const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  // Prisma record not found
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    error = new AppError("Record not found", 404);
  }

  // Prisma douplicate error
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    error = new AppError("Duplicate record. This value already exists.", 400);
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  console.error(error);

  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

export default globalErrorHandler;
