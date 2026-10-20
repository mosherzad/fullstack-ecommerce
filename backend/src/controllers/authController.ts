import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import {
  createAccessToken,
  CreateRefreshToken,
} from "../utils/generateTokens.js";
import { randomUUID } from "node:crypto";
import { createAndSendVerificationEmail } from "../services/emailVerification.js";
import type { Role } from "../generated/prisma/enums.js";

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password !== req.body.passwordConfirm)
      return next(new AppError("Passwords do not match", 400));

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
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

    await createAndSendVerificationEmail(user);

    res.status(201).json({
      status: "success",
      message:
        "Account created. Please check your email to verify your account.",
      data: { user },
    });
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    if (!user.isEmailVerified) {
      return next(
        new AppError("Please verify your email before logging in.", 403),
      );
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    const jti = randomUUID();

    const refreshToken = CreateRefreshToken(user.id, jti, user.tokenVersion);

    const tokenHash = await bcrypt.hash(refreshToken, 12);

    await prisma.refreshTokens.create({
      data: {
        tokenHash,
        userId: user.id,
        jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ status: "success", data: { user, accessToken } });
  },
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return next(
        new AppError("You are not logged in please login and try again", 401),
      );

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
        userId: string;
        role: string;
        iat: number;
        tokenVersion: number;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) return next(new AppError("User no longer exists", 401));

      if (user.tokenVersion !== decoded.tokenVersion) {
        return next(
          new AppError("You are logged out. Please login again.", 401),
        );
      }

      if (
        user.passwordChangedAt &&
        Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
      ) {
        return next(new AppError("Password changed, please login again", 401));
      }

      req.user = decoded;
    } catch (error) {
      return next(new AppError("Invalid or expired token", 401));
    }

    next();
  },
);

export const restrictTo = (...roles: Role[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role))
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );

    next();
  });

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return next(new AppError("User not found", 404));

    res.status(200).json({ status: "success", data: { user } });
  },
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.REFRESH_TOKEN_SECRET!,
        ) as {
          jti: string;
          userId: string;
        };

        await prisma.$transaction([
          prisma.user.update({
            where: { id: decoded.userId },
            data: {
              tokenVersion: { increment: 1 },
            },
          }),

          prisma.refreshTokens.deleteMany({ where: { jti: decoded.jti } }),
        ]);
      } catch (error) {
        if (
          error instanceof jwt.JsonWebTokenError ||
          error instanceof jwt.TokenExpiredError
        ) {
          return next(new AppError("Invalid or expired token", 401));
        }

        return next(error);
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  },
);
