import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "../controllers/orderController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import { createOrderSchema } from "../schemas/orderSchema.js";
import { updateCategorySchema } from "../schemas/categorySchema.js";

const router = Router();

router
  .route("/")
  .get(getAllOrders)
  .post(validateData(createOrderSchema), createOrder);

router
  .route("/:id")
  .get(validateId, getOrderById)
  .patch(validateId, validateData(updateCategorySchema), updateOrder)
  .delete(validateId, deleteOrder);

export default router;
