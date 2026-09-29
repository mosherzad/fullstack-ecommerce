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
