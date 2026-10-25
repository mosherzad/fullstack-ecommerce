import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 charachters"),
    email: z.string("Email is required").email("Please provide a valid email"),
    password: z
      .string("Password is required")
      .min(8, { error: "Password must be at least 8 charachters" }),
    passwordConfirm: z.string("Password confirm is required"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: z.string("Email is required").email("Please provide a valid email"),

  password: z.string("Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string("Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 charachters"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string("Password must be at least 8 charachters"),
  newPasswordConfirm: z.string("Password Confirm is required"),
});

export const updateUserProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "The name should be at least 3 characters")
      .max(12, "The name should not be more than 12 characters")
      .optional(),

    photo: z.string().optional(),
  })
  .refine((data) => data.name !== undefined || data.photo !== undefined, {
    message: "At least one field must be provided",
  });
