import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

export const validateProductId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.params.id || Array.isArray(req.params.id)) {
    return next(new AppError("Product ID is required", 400));
  }

  next();
};
