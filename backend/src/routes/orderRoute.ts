import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "../controllers/orderController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";

const router = Router();

router.route("/").post(createOrder).get(getAllOrders);

router
  .route("/:id")
  .get(validateId, getOrderById)
  .patch(validateId, updateOrder)
  .delete(validateId, deleteOrder);

export default router;
