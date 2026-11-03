import express from "express";
import {
  addToWishlist,
  getAllWishlistItems,
  getMyWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();
router.route("/").get(getAllWishlistItems);
router.route("/my-wishlist").get(protect, getMyWishlist);
router
  .route("/:id")
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

export default router;
