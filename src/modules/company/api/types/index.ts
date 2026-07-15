import { z } from "@hono/zod-openapi";

export const CompanySchema = z
  .object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    organizationId: z.string().openapi({ example: "org_123" }),
    name: z.string().openapi({ example: "Acme Trading PLC" }),
    slug: z.string().openapi({ example: "acme-trading" }),
    createdAt: z.string().datetime().openapi({ example: "2026-07-15T12:00:00.000Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-07-15T12:00:00.000Z" }),
  })
  .openapi("Company");

export const CreateCompanySchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Acme Trading PLC" }),
    slug: z.string().optional().openapi({ example: "acme-trading" }),
  })
  .openapi("CreateCompany");

export const UpdateCompanySchema = z
  .object({
    name: z.string().min(1).optional().openapi({ example: "Acme Trading PLC" }),
    slug: z.string().optional().openapi({ example: "acme-trading" }),
  })
  .openapi("UpdateCompany");
