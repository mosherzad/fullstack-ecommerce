import { Router } from "express";
import {
  updateOrderStatus,
  createOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/orderController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import { createOrderSchema } from "../schemas/orderSchema.js";
import { updateCategorySchema } from "../schemas/categorySchema.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = Router();

router
  .route("/")
  .get(getAllOrders)
  .post(protect, validateData(createOrderSchema), createOrder);

router
  .route("/:id")
  .get(validateId("id"), getOrderById)
  .patch(
    protect,
    validateId("id"),
    validateData(updateCategorySchema),
    updateOrderStatus,
  ); // TODO just for test i will remove restrictTo middleware after that i will added again
// .delete(protect, validateId("id"), deleteOrder);

export default router;
