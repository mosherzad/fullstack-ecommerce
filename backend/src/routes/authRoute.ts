import express from "express";
import { refreshAccessToken } from "../controllers/authController.js";

const router = express.Router();

router.route("/auth/refresh").post(refreshAccessToken);

export default router;
