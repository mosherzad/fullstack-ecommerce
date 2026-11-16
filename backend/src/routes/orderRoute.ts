import { Router } from "express";
import {
  updateOrderStatus,
  getMyOrders,
  checkout,
} from "../controllers/orderController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import { updateCategorySchema } from "../schemas/categorySchema.js";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  createOrderSchema,
  updateOrderSchema,
} from "../schemas/orderSchema.js";
import { getOrderById } from "../controllers/admin/orderController.js";

const router = Router();

router
  .route("/checkout")
  .post(protect, validateData(createOrderSchema), checkout);

router.route("/my-orders").get(protect, getMyOrders);

router
  .route("/:id")
  .get(protect, restrictTo("ADMIN"), validateId("id"), getOrderById)
  .patch(
    protect,
    validateId("id"),
    validateData(updateOrderSchema),
    updateOrderStatus,
  ); // TODO just for test i will remove restrictTo middleware after that i will added again
// .delete(protect, validateId("id"), deleteOrder);

export default router;
