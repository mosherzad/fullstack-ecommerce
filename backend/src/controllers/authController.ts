import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import crypto from "node:crypto";
import {
  createAccessToken,
  CreateRefreshToken,
} from "../utils/generateTokens.js";
import { randomUUID } from "node:crypto";
import { sendEmail } from "../utils/email.js";

interface RefreshTokenPayload extends jwt.JwtPayload {
  userId: string;
}

export const signUp = catchAsync(
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

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

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
      .json({ status: "success", data: { user, accessToken, refreshToken } });
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
        return next(new AppError("Password changed, Please login again", 401));
      }

      req.user = decoded;
    } catch (error) {
      return next(new AppError("Invalid or expired token", 401));
    }

    next();
  },
);

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

export const updatePassword = catchAsync(
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

export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    const message =
      "If an account with that email exists, you will receive a password reset link.";

    if (!user) {
      res.status(200).json({
        status: "success",
        message,
      });

      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    try {
      const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;

      await sendEmail(
        user.email,
        "Reset Password",
        `You requested a password reset.

Click the link below to reset your password:
${resetURL}

This link expires in 10 minutes.
If you did not request this, ignore this email.`,
      );

      res.status(200).json({
        status: "success",
        message,
      });
    } catch (error) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return next(
        new AppError(
          "There was an error sending email, please try again later",
          500,
        ),
      );
    }
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken as string)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: { passwordResetToken: hashedResetToken },
    });

    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() <= Date.now()
    )
      return next(new AppError("Invalid or expired token", 400));

    if (req.body.password !== req.body.newPasswordConfirm)
      return next(new AppError("Passwords are not match", 400));

    const hashedNewPassword = await bcrypt.hash(req.body.password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(Date.now()),
        tokenVersion: { increment: 1 },
      },
    });

    res
      .status(200)
      .json({ status: "success", message: "Password changed successfully" });
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
