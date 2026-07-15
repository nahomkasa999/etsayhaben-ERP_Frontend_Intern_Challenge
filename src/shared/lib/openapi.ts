export const openApiDocumentConfig = {
  openapi: "3.1.0" as const,
  info: {
    title: "EthioERP API",
    version: "1.0.0",
    description:
      "REST API for EthioERP. Auth endpoints are handled by Better Auth at `/api/v1/auth/*`.",
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
};

export const swaggerUiUrl = "/api/v1/doc";
