import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests. Please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many authentication attempts. Please try again later.",
  },
  skipSuccessfulRequests: true,
});

export const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many email requests. Please try again later.",
  },
  skipSuccessfulRequests: true,
});
