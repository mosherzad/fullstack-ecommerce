import express from "express";
import { generateProductSlug } from "../middleware/productSlugMiddleware.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import { validateProductId } from "../middleware/productIdMiddleware.js";
const router = express.Router();

router.route("/").get(getAllProducts).post(generateProductSlug, addProduct);

router
  .route("/:id")
  .get(validateProductId, getProductById)
  .patch(validateProductId, updateProduct)
  .delete(validateProductId, deleteProduct);

export default router;
