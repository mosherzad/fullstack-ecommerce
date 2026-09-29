import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateDate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: result.error.issues[0]?.message,
      });
    }

    next();
  };
};
