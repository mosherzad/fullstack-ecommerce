import exporess from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReviewById,
  updateReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { validateId } from "../middleware/validateIdMiddleware.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/reviewShema.js";

const router = exporess.Router();

router.route("/reviews").get(protect, restrictTo("ADMIN"), getAllReviews);

router
  .route("/products/:id/reviews")
  .post(
    protect,
    validateId("id"),
    validateData(createReviewSchema),
    createReview,
  );

router
  .route("/reviews/:reviewId")
  .get(validateId("reviewId"), getReviewById)
  .patch(
    protect,
    validateId("reviewId"),
    validateData(updateReviewSchema),
    updateReview,
  )
  .delete(protect, validateId("reviewId"), deleteReview);

export default router;
