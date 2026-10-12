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
import { validateData } from "../middleware/validationDataMiddleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/productSchema.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(validateData(createProductSchema), generateSlug, addProduct);

router
  .route("/:id")
  .get(validateId("id"), getProductById)
  .patch(validateData(updateProductSchema), validateId, updateProduct)
  .delete(validateId("id"), deleteProduct);

export default router;
