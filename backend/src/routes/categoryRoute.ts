import express from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { generateSlug } from "../middleware/createSlugMiddleware.js";

const router = express.Router();

router.route("/").get(getAllCategories);

router.route("/").post(generateSlug, addCategory);

router.route("/:id").get(validateId, getCategoryById);

router.route("/:id").patch(validateId, updateCategory);

router.route("/:id").delete(validateId, deleteCategory);

export default router;
