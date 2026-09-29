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
const router = express.Router();

router.route("/").get(getAllProducts).post(generateSlug, addProduct);

router
  .route("/:id")
  .get(validateId, getProductById)
  .patch(validateId, updateProduct)
  .delete(validateId, deleteProduct);

export default router;
