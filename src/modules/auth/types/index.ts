import { z } from "zod";

export const SignUpSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Invalid email address." })
      .transform((val) => val.trim()),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must be at most 30 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&#]/,
        "Password must contain at least one special character",
      ),
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .transform((val) => val.trim()),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const SignInSchema = z.object({
  email: z.string().email().transform((val) => val.trim()),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be at most 30 characters"),
});

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null | undefined;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  activeOrganizationId?: string | undefined;
} | null;

export type AuthSession = {
  session: Session;
  user: AuthUser;
};

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}
