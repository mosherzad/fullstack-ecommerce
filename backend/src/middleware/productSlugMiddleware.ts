import type { Request, Response, NextFunction } from "express";

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

export const generateProductSlug = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body.slug = createSlug(req.body.name);

  next();
};
