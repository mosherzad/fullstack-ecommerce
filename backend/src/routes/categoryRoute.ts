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
import { validateData } from "../middleware/validationDataMiddleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/categorySchema.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(generateSlug, validateData(createCategorySchema), addCategory);

router
  .route("/:id")
  .get(validateId, getCategoryById)
  .patch(validateId, validateData(updateCategorySchema), updateCategory)
  .delete(validateId, deleteCategory);

export default router;
