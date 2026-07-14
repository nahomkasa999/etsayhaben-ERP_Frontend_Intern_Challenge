import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const signUpSchema = z
  .object({
    email: z
      .email({
        message: "Invalid email address.",
      })
      .transform((val) =>
        sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
      ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must be at most 30 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&#]/,
        "Password must contain at least one special character",
      )
      .transform((val) =>
        sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
      ),
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .transform((val) =>
        sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z
    .email()
    .transform((val) =>
      sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be at most 30 characters")
    .transform((val) =>
      sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
    ),
});

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null | undefined;
};

export type session = {
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
  session: session;
  user: AuthUser;
};
