import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

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
      const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;

      await sendEmail(
        user.email,
        "Reset Password",
        `You requested a password reset.

Click the link below to reset your password:
${resetURL}

This link expires in 10 minutes.
If you did not request this, please ignore this email.`,
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

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          passwordChangedAt: new Date(),
          tokenVersion: { increment: 1 },
        },
      }),

      prisma.refreshTokens.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    res
      .status(200)
      .json({ status: "success", message: "Password changed successfully" });
  },
);
