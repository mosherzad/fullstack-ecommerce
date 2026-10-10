import express from "express";
import { generateSlug } from "../middleware/createSlugMiddleware.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { validateDate } from "../middleware/validationDataMiddleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/productSchema.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(validateDate(createProductSchema), generateSlug, addProduct);

router
  .route("/:id")
  .get(validateId, getProductById)
  .patch(validateDate(updateProductSchema), validateId, updateProduct)
  .delete(validateId, deleteProduct);

export default router;
