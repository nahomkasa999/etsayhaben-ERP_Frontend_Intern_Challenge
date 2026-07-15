import { z } from "@hono/zod-openapi";

export const WorkspaceSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().openapi({ example: "Main Workspace" }),
    createdAt: z.string().datetime().openapi({ example: "2026-07-15T12:00:00.000Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-07-15T12:00:00.000Z" }),
  })
  .openapi("Workspace");

export const CreateWorkspaceSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Main Workspace" }),
  })
  .openapi("CreateWorkspace");
