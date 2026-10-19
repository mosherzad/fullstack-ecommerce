import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
export const sendVerificationEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const genericResponse = () =>
      res.status(200).json({
        status: "success",
        message:
          "If the account exists and needs verification, a verification email will be sent.",
      });

    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user || user.isEmailVerified) {
      genericResponse();
      return;
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const hashedVerifyEmailToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerifyEmailToken,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const verifyURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${verifyToken}`;
    try {
      await sendEmail(
        user.email,
        "Verify You Email",
        `Click the link below to verify your email:
${verifyURL}

This link expires in 10 minutes.`,
      );

      res.status(200).json({
        status: "success",
        message: "Check you inbox verification link was send",
      });
    } catch (error) {
      await prisma.user.updateMany({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
      return next(new AppError("Failed to send verification email", 500));
    }
  },
);

export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedVerifyToken = crypto
      .createHash("sha256")
      .update(req.params.verifyToken as string)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: hashedVerifyToken },
    });

    if (
      !user ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires.getTime() <= Date.now()
    )
      return next(new AppError("Invalid or expired token", 400));

    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        emailVerificationToken: hashedVerifyToken,
        emailVerificationExpires: {
          gt: new Date(),
        },
        isEmailVerified: false,
      },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    if (result.count === 0) {
      return next(new AppError("Invalid or expired token", 400));
    }

    res.status(200).json({
      status: "success",
      message: "Your account has been verified successfully",
    });
  },
);
