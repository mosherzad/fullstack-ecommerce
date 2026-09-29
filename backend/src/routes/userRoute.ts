import express from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
} from "../controllers/userController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { login, signUp } from "../controllers/authController.js";
import { validateDate } from "../middleware/validationDataMiddleware.js";
import { loginSchema, signUpSchema } from "../schemas/userSchema.js";
const router = express.Router();

router.route("/").get(getUsers);
router.route("/sign-up").post(validateDate(signUpSchema), signUp);
router.route("/login").post(validateDate(loginSchema), login);
router
  .route("/:id")
  .get(validateId, getUserById)
  .delete(validateId, deleteUser);

export default router;
