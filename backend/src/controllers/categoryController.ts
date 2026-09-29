import prisma from "../lib/prisma.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

const getAllCategories = catchAsync(async (req, res, next) => {
  const categoies = await prisma.category.findMany();

  res.status(200).json({ status: "success", data: { categoies } });
});

const getCategoryById = catchAsync(async (req, res, next) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id as string },
  });

  if (!category) return next(new AppError("Record not found", 404));

  res.status(200).json({ status: "success", data: { category } });
});

const addCategory = catchAsync(async (req, res, next) => {
  const newCategory = await prisma.category.create({ data: req.body });

  res.status(201).json({ status: "success", data: { newCategory } });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const updatedCategory = await prisma.category.update({
    where: { id: req.params.id as string },
    data: req.body,
  });

  res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    data: { updatedCategory },
  });
});

const deleteCategory = catchAsync(async (req, res, next) => {
  await prisma.category.delete({
    where: { id: req.params.id as string },
  });

  res.status(200).json({
    status: "success",
  });
});

export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};
