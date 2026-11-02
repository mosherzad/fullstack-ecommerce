import express from "express";
import {
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { getAllProductsSchema } from "../schemas/paginationSchema.js";
import { validateQuery } from "../middleware/validateQuery.js";

const router = express.Router();

router.route("/").get(validateQuery(getAllProductsSchema), getAllProducts);

router.route("/:id").get(validateId("id"), getProductById);

export default router;
