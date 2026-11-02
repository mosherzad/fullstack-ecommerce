import express from "express";
import { updateMe } from "../controllers/userController.js";
import { protect } from "../controllers/authController.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import { updateUserProfileSchema } from "../schemas/userSchema.js";

const router = express.Router();

router
  .route("/me")
  .patch(protect, validateData(updateUserProfileSchema), updateMe);

export default router;
