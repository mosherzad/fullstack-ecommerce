import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.route("/").post(async (req, res, next) => {
  const newCategory = await prisma.category.create({ data: req.body });

  res.status(201).json({ status: "success", data: { newCategory } });
});

export default router;
