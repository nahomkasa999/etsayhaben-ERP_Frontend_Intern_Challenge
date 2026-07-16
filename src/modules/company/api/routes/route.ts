import { createRoute, z } from "@hono/zod-openapi";
import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppVariables } from "@/app/api/types/context";
import { isOrganizationOwner } from "@/app/api/types/context";
import { auth } from "@/lib/auth";
import { ACTIVE_COMPANY_COOKIE } from "@/modules/company/types/constants";
import {
  CompaniesListResponseSchema,
  CompanySchema,
  CreateCompanySchema,
  DeleteCompanyResponseSchema,
  SelectCompanyResponseSchema,
  SelectCompanySchema,
  UpdateCompanySchema,
} from "@/modules/company/types";
import {
  checkSlugExists,
  CompanyRepositoryError,
  createCompany,
  deleteCompany as deleteCompanyRepo,
  ensureUniqueCompanySlug,
  getCompanyById,
  listCompanies,
  updateCompany as updateCompanyRepo,
} from "./companyRepository";
import { slugify } from "@/shared/lib/slug";

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("CompanyErrorResponse");

const authErrorResponses = {
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
  404: {
    description: "Not found",
    content: { "application/json": { schema: ErrorSchema } },
  },
} as const;

type CompanyEnv = { Variables: AppVariables };

async function resolveOrgContext(c: Context<CompanyEnv>) {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return { ok: false as const, response: c.json({ error: "Unauthorized" }, 401) };
  }

  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return { ok: false as const, response: c.json({ error: "No active organization selected" }, 400) };
  }

  const member = await auth.api.getSession({ headers: c.req.raw.headers }).then(
    (s) => s?.session.activeOrganizationId === organizationId,
  );

  if (!member) {
    return { ok: false as const, response: c.json({ error: "Forbidden" }, 403) };
  }

  return { ok: true as const, organizationId, userId: user.id };
}

function repositoryErrorResponse(
  c: Context<CompanyEnv>,
  error: CompanyRepositoryError,
  status: ContentfulStatusCode,
) {
  return c.json({ error: error.message }, status);
}

function setActiveCompanyCookie(c: Context, companyId: string) {
  setCookie(c, ACTIVE_COMPANY_COOKIE, companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });
}

function clearActiveCompanyCookie(c: Context) {
  setCookie(c, ACTIVE_COMPANY_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 0,
  });
}

export const listCompaniesRoute = createRoute({
  method: "get",
  path: "/companies",
  tags: ["Companies"],
  summary: "List companies in the active organization",
  responses: {
    200: {
      description: "Companies for the active organization",
      content: {
        "application/json": {
          schema: CompaniesListResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const listCompaniesHandler = async (c: Context<CompanyEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return c.json({ error: "No active organization selected" }, 400);
  }

  const companies = await listCompanies(organizationId);

  const cookieCompanyId = getCookie(c, ACTIVE_COMPANY_COOKIE);
  let activeCompanyId: string | null = null;

  if (cookieCompanyId) {
    const match = companies.find((company) => company.id === cookieCompanyId);
    activeCompanyId = match?.id ?? null;
  }

  return c.json(
    {
      companies,
      activeCompanyId,
    },
    200,
  );
};

export const createCompanyRoute = createRoute({
  method: "post",
  path: "/companies",
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
    409: {
      description: "Conflict",
      content: { "application/json": { schema: ErrorSchema } },
    },
    ...authErrorResponses,
  },
});

export const createCompanyHandler = async (c: Context<CompanyEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return c.json({ error: "No active organization selected" }, 400);
  }

  const body = CreateCompanySchema.parse(await c.req.json());
  const name = body.name.trim();

  if (!name) {
    return c.json({ error: "Company name is required" }, 400);
  }

  const baseSlug = slugify(body.slug?.trim() || name);

  if (!baseSlug) {
    return c.json({ error: "Company slug could not be generated" }, 400);
  }

  const slug = await ensureUniqueCompanySlug(organizationId, baseSlug);

  try {
    const company = await createCompany(organizationId, name, slug);
    setActiveCompanyCookie(c, company.id);
    return c.json(company, 201);
  } catch (error) {
    if (error instanceof CompanyRepositoryError) {
      return repositoryErrorResponse(c, error, 409);
    }
    throw error;
  }
};

export const getCompanyRoute = createRoute({
  method: "get",
  path: "/companies/{id}",
  tags: ["Companies"],
  summary: "Get a company in the active organization",
  request: {
    params: z.object({
      id: z.string().uuid(),
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
    ...authErrorResponses,
  },
});

export const getCompanyHandler = async (c: Context<CompanyEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return c.json({ error: "No active organization selected" }, 400);
  }

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    const company = await getCompanyById(id, organizationId);
    return c.json(company, 200);
  } catch (error) {
    if (error instanceof CompanyRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};

export const updateCompanyRoute = createRoute({
  method: "patch",
  path: "/companies/{id}",
  tags: ["Companies"],
  summary: "Update a company in the active organization",
  request: {
    params: z.object({
      id: z.string().uuid(),
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
    409: {
      description: "Conflict",
      content: { "application/json": { schema: ErrorSchema } },
    },
    ...authErrorResponses,
  },
});

export const updateCompanyHandler = async (c: Context<CompanyEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return c.json({ error: "No active organization selected" }, 400);
  }

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());
  const body = UpdateCompanySchema.parse(await c.req.json());

  const data: { name?: string; slug?: string } = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) {
      return c.json({ error: "Company name is required" }, 400);
    }
    data.name = name;
  }

  if (body.slug !== undefined) {
    const slug = slugify(body.slug.trim());
    if (!slug) {
      return c.json({ error: "Company slug is required" }, 400);
    }

    const exists = await checkSlugExists(organizationId, slug, id);
    if (exists) {
      return c.json({ error: "Company slug is already taken" }, 409);
    }

    data.slug = slug;
  }

  try {
    const company = await updateCompanyRepo(id, organizationId, data);
    return c.json(company, 200);
  } catch (error) {
    if (error instanceof CompanyRepositoryError) {
      return repositoryErrorResponse(c, error, error.status === 409 ? 409 : 404);
    }
    throw error;
  }
};

export const deleteCompanyRoute = createRoute({
  method: "delete",
  path: "/companies/{id}",
  tags: ["Companies"],
  summary: "Delete a company in the active organization",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Company deleted",
      content: {
        "application/json": {
          schema: DeleteCompanyResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const deleteCompanyHandler = async (c: Context<CompanyEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return c.json({ error: "No active organization selected" }, 400);
  }

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    await deleteCompanyRepo(id, organizationId);

    if (getCookie(c, ACTIVE_COMPANY_COOKIE) === id) {
      clearActiveCompanyCookie(c);
    }

    return c.json({ success: true as const }, 200);
  } catch (error) {
    if (error instanceof CompanyRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};

export const selectCompanyRoute = createRoute({
  method: "post",
  path: "/companies/select",
  tags: ["Companies"],
  summary: "Select the active company for the current session",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SelectCompanySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Active company selected",
      content: {
        "application/json": {
          schema: SelectCompanyResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const selectCompanyHandler = async (c: Context<CompanyEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return c.json({ error: "No active organization selected" }, 400);
  }

  const { companyId } = SelectCompanySchema.parse(await c.req.json());

  try {
    const company = await getCompanyById(companyId, organizationId);
    setActiveCompanyCookie(c, company.id);

    return c.json(
      {
        company,
        activeCompanyId: company.id,
      },
      200,
    );
  } catch (error) {
    if (error instanceof CompanyRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};
