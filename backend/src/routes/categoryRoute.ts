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
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(
    protect,
    restrictTo("ADMIN"),
    generateSlug,
    validateData(createCategorySchema),
    addCategory,
  );

router
  .route("/:id")
  .get(validateId("id"), getCategoryById)
  .patch(
    protect,
    restrictTo("ADMIN"),
    validateId("id"),
    validateData(updateCategorySchema),
    updateCategory,
  )
  .delete(protect, restrictTo("ADMIN"), validateId("id"), deleteCategory);

export default router;
