import type { Role } from "../generated/prisma/enums.js";
import jwt from "jsonwebtoken";

export const createAccessToken = (
  userId: string,
  role: Role,
  tokenVersion: number,
) => {
  return jwt.sign(
    { userId, role, tokenVersion },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15m",
    },
  );
};

export const CreateRefreshToken = (
  userId: string,
  jti: string,
  tokenVersion: number,
) => {
  return jwt.sign(
    { userId, jti, tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    },
  );
};
