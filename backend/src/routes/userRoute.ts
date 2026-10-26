import express from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
  updateMe,
} from "../controllers/userController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import { updateUserProfileSchema } from "../schemas/userSchema.js";

const router = express.Router();

router.route("/").get(protect, getUsers);
router
  .route("/me")
  .patch(protect, validateData(updateUserProfileSchema), updateMe);
router
  .route("/:id")
  .get(validateId("id"), getUserById)
  .delete(protect, restrictTo("ADMIN"), validateId("id"), deleteUser);

export default router;
