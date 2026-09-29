import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import AppError from "../utils/appError.js";

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password !== req.body.passwordConfirm)
      return next(new AppError("Passwords do not match", 400));

    if (!req.body.email) return next(new AppError("Email is required", 400));
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      },
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(user);
    res.status(201).json({ status: "success", data: { user } });
  },
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    res.status(200).json({ status: "success" });
  },
);

export { signUp, login };
