import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
} from "../controllers/admin/couponController.js";
import { validateData } from "../middleware/validationDataMiddleware.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../schemas/couponSchema.js";
import { validateId } from "../middleware/validateIdMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    restrictTo("ADMIN"),
    validateData(createCouponSchema),
    createCoupon,
  )
  .get(protect, restrictTo("ADMIN"), getAllCoupons);

router
  .route("/:id")
  .get(protect, restrictTo("ADMIN"), validateId("id"), getCouponById)
  .patch(
    protect,
    restrictTo("ADMIN"),
    validateId("id"),
    validateData(updateCouponSchema),
    updateCoupon,
  )
  .delete(protect, restrictTo("ADMIN"), validateId("id"), deleteCoupon);

export default router;
