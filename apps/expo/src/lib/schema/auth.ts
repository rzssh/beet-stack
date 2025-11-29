import * as v from "valibot";

export const loginSchema = v.object({
  email: v.pipe(
    v.string("Email is required"),
    v.nonEmpty("Email is required"),
    v.email("Invalid email address"),
  ),
  password: v.pipe(
    v.string("Password is required"),
    v.nonEmpty("Password is required"),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
});

export const signupSchema = v.object({
  name: v.pipe(
    v.string("Name is required"),
    v.nonEmpty("Name is required"),
    v.minLength(2, "Name must be at least 2 characters"),
  ),
  email: v.pipe(
    v.string("Email is required"),
    v.nonEmpty("Email is required"),
    v.email("Invalid email address"),
  ),
  password: v.pipe(
    v.string("Password is required"),
    v.nonEmpty("Password is required"),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
});

export type LoginInput = v.InferOutput<typeof loginSchema>;
export type SignupInput = v.InferOutput<typeof signupSchema>;
