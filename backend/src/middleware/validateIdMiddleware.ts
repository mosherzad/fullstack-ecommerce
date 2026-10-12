import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

export const validateId = (ID: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[ID];

    if (!id || Array.isArray(id)) {
      return next(new AppError("ID is required", 400));
    }

    next();
  };
};
