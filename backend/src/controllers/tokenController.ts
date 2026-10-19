import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcrypt";
import { catchAsync } from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

interface RefreshTokenPayload extends jwt.JwtPayload {
  userId: string;
}

export const refreshAccessToken = catchAsync(
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

    if (payload.tokenVersion !== refreshTokenRecord.user.tokenVersion) {
      return next(
        new AppError("Invalid refresh token. Please log in again.", 401),
      );
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
        tokenVersion: refreshTokenRecord.user.tokenVersion,
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
        tokenVersion: refreshTokenRecord.user.tokenVersion,
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
