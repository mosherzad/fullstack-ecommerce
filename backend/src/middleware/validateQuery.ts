import { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";

export const validateQuery = (schema: ZodType) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    schema.parse(req.query);
    next();
  });
