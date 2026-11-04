import express from "express";
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../controllers/authController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";

const router = express.Router();
router.route("/my-wishlist").get(protect, getMyWishlist);
router
  .route("/:id")
  .post(protect, validateId("id"), addToWishlist)
  .delete(protect, validateId("id"), removeFromWishlist);

export default router;
