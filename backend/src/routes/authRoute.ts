import express from "express";
import {
  protect,
  getMe,
  refreshAccessToken,
  signUp,
  login,
  updatePassword,
} from "../controllers/authController.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import {
  changePasswordSchema,
  loginSchema,
  signUpSchema,
} from "../schemas/userSchema.js";

const router = express.Router();

router.route("/sign-up").post(validateData(signUpSchema), signUp);

router.route("/login").post(validateData(loginSchema), login);

router.route("/refresh").post(refreshAccessToken);

router.route("/me").get(protect, getMe);

router
  .route("/update-password")
  .post(protect, validateData(changePasswordSchema), updatePassword);

export default router;
