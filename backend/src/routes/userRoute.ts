import express from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
} from "../controllers/userController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { forgetPassword, protect } from "../controllers/authController.js";

const router = express.Router();

router.route("/").get(getUsers);
router
  .route("/:id")
  .get(protect, validateId("id"), getUserById)
  .delete(protect, validateId("id"), deleteUser);

router.route("/forget-password").post(forgetPassword);
export default router;
