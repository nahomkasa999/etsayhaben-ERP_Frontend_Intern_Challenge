import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const HealthResponseSchema = z
  .object({
    status: z.literal("ok").openapi({ example: "ok" }),
  })
  .openapi("HealthResponse");

export const healthApp = new OpenAPIHono();

const healthRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["System"],
  summary: "Health check",
  responses: {
    200: {
      description: "API is healthy",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

healthApp.openapi(healthRoute, (c) => c.json({ status: "ok" as const }, 200));
