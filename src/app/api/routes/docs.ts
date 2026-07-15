import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import type { AppVariables } from "@/app/api/types/context";
import { openApiDocumentConfig, swaggerUiUrl } from "@/shared/lib/openapi";

export function registerDocs(app: OpenAPIHono<{ Variables: AppVariables }>) {
  app.doc("/doc", openApiDocumentConfig);
  app.get("/ui", swaggerUI({ url: swaggerUiUrl }));
}
