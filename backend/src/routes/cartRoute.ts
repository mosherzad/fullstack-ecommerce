import express from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cartController.js";
import { protect } from "../controllers/authController.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../schemas/cartSchema.js";
import { validateId } from "../middleware/validateIdMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getCart).delete(clearCart);
router.post("/items", validateData(addToCartSchema), addToCart);
router
  .route("/items/:productId")
  .patch(
    validateId("productId"),
    validateData(updateCartItemSchema),
    updateCartItem,
  )
  .delete(validateId("productId"), removeCartItem);

export default router;
