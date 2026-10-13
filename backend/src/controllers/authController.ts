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

interface RefreshTokenPayload extends jwt.JwtPayload {
  userId: string;
}

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

    const accessToken = createAccessToken(user.id, user.role);

    const jti = randomUUID();

    const refreshToken = CreateRefreshToken(user.id, jti);

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
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ status: "success", data: { user, accessToken, refreshToken } });
  },
);

const protect = catchAsync(
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
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) return next(new AppError("User no longer exists", 401));

      if (
        user.passwordChangedAt &&
        Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
      ) {
        return next(new AppError("Password changed, Please login again", 401));
      }

      req.user = decoded;
    } catch (error) {
      return next(new AppError("Invalid or expired token", 401));
    }

    next();
  },
);

const refreshAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 401));
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as RefreshTokenPayload;

    if (!payload.userId || !payload.jti) {
      return next(new AppError("Invalid refresh token", 401));
    }

    const refreshTokenRecord = await prisma.refreshTokens.findFirst({
      where: {
        userId: payload.userId,
        jti: payload.jti,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!refreshTokenRecord) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      refreshTokenRecord.tokenHash,
    );

    if (!isValid) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }

    const newJti = randomUUID();

    const newRefreshToken = jwt.sign(
      {
        userId: refreshTokenRecord.user.id,
        jti: newJti,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    const newTokenHash = await bcrypt.hash(newRefreshToken, 12);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const rotation = await prisma.refreshTokens.updateMany({
      where: {
        id: refreshTokenRecord.id,
        jti: payload.jti,
      },
      data: {
        jti: newJti,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      },
    });

    if (rotation.count !== 1) {
      return next(new AppError("Refresh token has already been used", 401));
    }

    const accessToken = jwt.sign(
      {
        userId: refreshTokenRecord.user.id,
        role: refreshTokenRecord.user.role,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      status: "success",
      accessToken,
    });
  },
);

const getMe = catchAsync(
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

const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) return next(new AppError("User not found", 404));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.currentPassword,
      user.password,
    );

    if (!isPasswordCorrect)
      return next(new AppError("Current password is incorrect", 400));

    const newHashedPassword = await bcrypt.hash(req.body.newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: newHashedPassword,
          passwordChangedAt: new Date(),
        },
      }),

      prisma.refreshTokens.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Password changed successfully, Please login again",
    });
  },
);
export { signUp, login, protect, refreshAccessToken, getMe, updatePassword };
