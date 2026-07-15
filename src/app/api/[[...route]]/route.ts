import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { handle } from "hono/vercel";
import { auth } from "@/lib/auth";
import { openApiDocumentConfig, swaggerUiUrl } from "@/shared/lib/openapi";

const HealthResponseSchema = z
  .object({
    status: z.literal("ok").openapi({ example: "ok" }),
  })
  .openapi("HealthResponse");

const app = new OpenAPIHono().basePath("/api/v1");

const healthRoute = createRoute({
  method: "get",
  path: "/health",
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

app.openapi(healthRoute, (c) => c.json({ status: "ok" as const }, 200));

app.on(["POST", "GET"], "/auth*", (c) => auth.handler(c.req.raw));

app.doc("/doc", openApiDocumentConfig);
app.get("/ui", swaggerUI({ url: swaggerUiUrl }));

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
