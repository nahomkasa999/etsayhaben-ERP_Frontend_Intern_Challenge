import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  requireOrganization,
  requireSession,
} from "@/app/api/middleware/session";
import type { AppVariables } from "@/app/api/types/context";
import {
  CompanySchema,
  CreateCompanySchema,
  UpdateCompanySchema,
} from "../types";
import {
  CompanyServiceError,
  createCompany,
  deleteCompany,
  getCompanyForOrganization,
  listCompanies,
  updateCompany,
} from "../../services/companyService";

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("ErrorResponse");

function toCompanyResponse(company: {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: company.id,
    organizationId: company.organizationId,
    name: company.name,
    slug: company.slug,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export const companyApp = new OpenAPIHono<{ Variables: AppVariables }>();

companyApp.use("*", requireSession);
companyApp.use("*", requireOrganization);

const listCompaniesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Companies"],
  summary: "List companies in the active organization",
  responses: {
    200: {
      description: "Companies for the active organization",
      content: {
        "application/json": {
          schema: z.object({
            companies: z.array(CompanySchema),
          }),
        },
      },
    },
    400: {
      description: "No active organization",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const createCompanyRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Companies"],
  summary: "Create a company in the active organization",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCompanySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Company created",
      content: {
        "application/json": {
          schema: CompanySchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const getCompanyRoute = createRoute({
  method: "get",
  path: "/{companyId}",
  tags: ["Companies"],
  summary: "Get a company in the active organization",
  request: {
    params: z.object({
      companyId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Company details",
      content: {
        "application/json": {
          schema: CompanySchema,
        },
      },
    },
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const updateCompanyRoute = createRoute({
  method: "patch",
  path: "/{companyId}",
  tags: ["Companies"],
  summary: "Update a company in the active organization",
  request: {
    params: z.object({
      companyId: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCompanySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Company updated",
      content: {
        "application/json": {
          schema: CompanySchema,
        },
      },
    },
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const deleteCompanyRoute = createRoute({
  method: "delete",
  path: "/{companyId}",
  tags: ["Companies"],
  summary: "Delete a company in the active organization",
  request: {
    params: z.object({
      companyId: z.string().uuid(),
    }),
  },
  responses: {
    204: {
      description: "Company deleted",
    },
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

companyApp.openapi(listCompaniesRoute, async (c) => {
  const organizationId = c.get("organizationId");
  const companies = await listCompanies(organizationId);

  return c.json(
    {
      companies: companies.map(toCompanyResponse),
    },
    200,
  );
});

companyApp.openapi(createCompanyRoute, async (c) => {
  const organizationId = c.get("organizationId");
  const body = c.req.valid("json");

  try {
    const company = await createCompany(organizationId, body);
    return c.json(toCompanyResponse(company), 201);
  } catch (error) {
    if (error instanceof CompanyServiceError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

companyApp.openapi(getCompanyRoute, async (c) => {
  const organizationId = c.get("organizationId");
  const { companyId } = c.req.valid("param");

  const company = await getCompanyForOrganization(organizationId, companyId);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  return c.json(toCompanyResponse(company), 200);
});

companyApp.openapi(updateCompanyRoute, async (c) => {
  const organizationId = c.get("organizationId");
  const { companyId } = c.req.valid("param");
  const body = c.req.valid("json");

  try {
    const company = await updateCompany(organizationId, companyId, body);
    return c.json(toCompanyResponse(company), 200);
  } catch (error) {
    if (error instanceof CompanyServiceError) {
      return c.json(
        { error: error.message },
        error.status === 404 ? 404 : 400,
      );
    }
    throw error;
  }
});

companyApp.openapi(deleteCompanyRoute, async (c) => {
  const organizationId = c.get("organizationId");
  const { companyId } = c.req.valid("param");

  try {
    await deleteCompany(organizationId, companyId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof CompanyServiceError) {
      return c.json({ error: error.message }, 404);
    }
    throw error;
  }
});
