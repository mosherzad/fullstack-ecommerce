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

router.route("/").get(getAllCategories).post(generateSlug, addCategory);

router
  .route("/:id")
  .get(validateId, getCategoryById)
  .patch(validateId, updateCategory)
  .delete(validateId, deleteCategory);

export default router;
