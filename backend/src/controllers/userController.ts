import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: req.body,
  });

  res.status(200).json({ status: "success", data: { user } });
});
