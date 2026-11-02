import express from "express";
import { getDashboardStats } from "../controllers/admin/adminController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { validateQuery } from "../middleware/validateQuery.js";
import {
  getAllOrdersSchema,
  getAllProductsSchema,
} from "../schemas/paginationSchema.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/productSchema.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { generateSlug } from "../middleware/createSlugMiddleware.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/admin/productController.js";
import {
  deleteUser,
  getUserById,
  getUsers,
} from "../controllers/admin/userController.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/categorySchema.js";
import {
  addCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/admin/categoryController.js";
import { getAllOrders } from "../controllers/admin/orderController.js";
import { getAllReviews } from "../controllers/admin/reviewController.js";

const router = express.Router();

router.use(protect, restrictTo("ADMIN"));

router.route("/dashboard").get(getDashboardStats);

router
  .route("/products")
  .get(validateQuery(getAllProductsSchema), getAllProducts)
  .post(validateData(createProductSchema), generateSlug, addProduct);
router
  .route("/products/:id")
  .patch(validateData(updateProductSchema), validateId("id"), updateProduct)
  .delete(validateId("id"), deleteProduct);

router.route("/users").get(getUsers);
router
  .route("/users/:id")
  .get(validateId("id"), getUserById)
  .delete(validateId("id"), deleteUser);

router
  .route("/categories")
  .post(validateData(createCategorySchema), generateSlug, addCategory);

router
  .route("/categories/:id")
  .patch(validateId("id"), validateData(updateCategorySchema), updateCategory)
  .delete(validateId("id"), deleteCategory);

router.route("/orders").get(validateQuery(getAllOrdersSchema), getAllOrders);

router.route("/reviews").get(getAllReviews);
export default router;
