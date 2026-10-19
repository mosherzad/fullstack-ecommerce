// services/emailVerification.ts

import crypto from "node:crypto";
import { sendEmail } from "../utils/email.js"; // Adjust this path to your Nodemailer file.
import prisma from "../lib/prisma.js";

type VerificationUser = {
  id: string;
  email: string;
};

export const createAndSendVerificationEmail = async (
  user: VerificationUser,
) => {
  const verifyToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const verifyURL = `${process.env.API_URL}/api/v1/auth/verify-email/${verifyToken}`;

  try {
    await sendEmail(
      user.email,
      "Verify Your Email",
      `Welcome!

Click the link below to verify your email:
${verifyURL}

This link expires in 10 minutes.`,
    );
  } catch (error) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    throw error;
  }
};
