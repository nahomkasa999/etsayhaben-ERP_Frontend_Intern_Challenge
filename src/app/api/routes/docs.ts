import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDocumentConfig, swaggerUiUrl } from "@/shared/lib/openapi";

export function registerDocs(app: OpenAPIHono) {
  app.doc("/doc", openApiDocumentConfig);
  app.get("/ui", swaggerUI({ url: swaggerUiUrl }));
}
