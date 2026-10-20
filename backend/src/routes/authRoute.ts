import express from "express";
import {
  protect,
  getMe,
  signUp,
  login,
  logout,
} from "../controllers/authController.js";

import { validateData } from "../middleware/validationDataMiddleware.js";
import {
  changePasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "../schemas/userSchema.js";
import {
  authLimiter,
  emailLimiter,
} from "../middleware/rateLimiterMiddleware.js";
import {
  forgetPassword,
  resetPassword,
  updatePassword,
} from "../controllers/passwordController.js";
import {
  sendVerificationEmail,
  verifyEmail,
} from "../controllers/emailValidationController.js";
import { refreshAccessToken } from "../controllers/tokenController.js";

const router = express.Router();

router.route("/sign-up").post(authLimiter, validateData(signUpSchema), signUp);
router.route("/login").post(authLimiter, validateData(loginSchema), login);
router.route("/refresh").post(authLimiter, refreshAccessToken);
router.route("/me").get(protect, getMe);
router.route("/logout").post(protect, logout);

router
  .route("/update-password")
  .patch(
    protect,
    authLimiter,
    validateData(changePasswordSchema),
    updatePassword,
  );

router.route("/forget-password").post(emailLimiter, forgetPassword);
router
  .route("/reset-password/:resetToken")
  .patch(authLimiter, validateData(resetPasswordSchema), resetPassword);
router.route("/resend-verification").post(emailLimiter, sendVerificationEmail);
router.route("/send-verification-email").post(sendVerificationEmail);
router.route("/verify-email/:verifyToken").post(verifyEmail);

export default router;
