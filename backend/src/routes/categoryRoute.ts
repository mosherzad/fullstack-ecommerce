import express from "express";
import {
  getAllCategories,
  getCategoryById,
} from "../controllers/categoryController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";

const router = express.Router();

router.route("/").get(getAllCategories);

router.route("/:id").get(validateId("id"), getCategoryById);
export default router;
