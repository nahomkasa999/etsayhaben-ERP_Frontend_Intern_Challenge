import { createRoute, z } from "@hono/zod-openapi";
import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import prisma from "@/lib/db";
import { isOrganizationOwner, type AppVariables } from "@/app/api/types/context";
import { ACTIVE_COMPANY_COOKIE } from "@/modules/company/constants";
import {
  CompaniesListResponseSchema,
  CompanySchema,
  CreateCompanySchema,
  DeleteCompanyResponseSchema,
  SelectCompanyResponseSchema,
  SelectCompanySchema,
  UpdateCompanySchema,
} from "@/modules/company/types";
import { slugify } from "@/shared/lib/slug";

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("ErrorResponse");

type CompanyEnv = { Variables: AppVariables };

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

async function ensureUniqueCompanySlug(organizationId: string, baseSlug: string) {
  let slug = baseSlug || "company";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.company.findFirst({
      where: { organizationId, slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
  }
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

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const companies = await prisma.company.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });

  const cookieCompanyId = getCookie(c, ACTIVE_COMPANY_COOKIE);
  let activeCompanyId: string | null = null;

  if (cookieCompanyId) {
    const match = companies.find((company) => company.id === cookieCompanyId);
    activeCompanyId = match?.id ?? null;
  }

  return c.json(
    {
      companies: companies.map(toCompanyResponse),
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

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (!isOrganizationOwner(member)) {
    return c.json({ error: "Only organization owners can create companies" }, 403);
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

  const company = await prisma.company.create({
    data: {
      organizationId,
      name,
      slug,
    },
  });

  setActiveCompanyCookie(c, company.id);

  return c.json(toCompanyResponse(company), 201);
};

export const getCompanyRoute = createRoute({
  method: "get",
  path: "/companies/{companyId}",
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
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    400: {
      description: "No active organization",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
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

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const { companyId } = z
    .object({
      companyId: z.string().uuid(),
    })
    .parse(c.req.param());

  const company = await prisma.company.findFirst({
    where: { id: companyId, organizationId },
  });

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  return c.json(toCompanyResponse(company), 200);
};

export const updateCompanyRoute = createRoute({
  method: "patch",
  path: "/companies/{companyId}",
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
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorSchema } },
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

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (!isOrganizationOwner(member)) {
    return c.json({ error: "Only organization owners can update companies" }, 403);
  }

  const { companyId } = z
    .object({
      companyId: z.string().uuid(),
    })
    .parse(c.req.param());

  const body = UpdateCompanySchema.parse(await c.req.json());

  const company = await prisma.company.findFirst({
    where: { id: companyId, organizationId },
  });

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

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

    const existing = await prisma.company.findFirst({
      where: {
        organizationId,
        slug,
        NOT: { id: companyId },
      },
      select: { id: true },
    });

    if (existing) {
      return c.json({ error: "Company slug is already taken" }, 400);
    }

    data.slug = slug;
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data,
  });

  return c.json(toCompanyResponse(updated), 200);
};

export const deleteCompanyRoute = createRoute({
  method: "delete",
  path: "/companies/{companyId}",
  tags: ["Companies"],
  summary: "Delete a company in the active organization",
  request: {
    params: z.object({
      companyId: z.string().uuid(),
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
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    400: {
      description: "No active organization",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
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

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (!isOrganizationOwner(member)) {
    return c.json({ error: "Only organization owners can delete companies" }, 403);
  }

  const { companyId } = z
    .object({
      companyId: z.string().uuid(),
    })
    .parse(c.req.param());

  const company = await prisma.company.findFirst({
    where: { id: companyId, organizationId },
  });

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  await prisma.company.delete({
    where: { id: companyId },
  });

  if (getCookie(c, ACTIVE_COMPANY_COOKIE) === companyId) {
    clearActiveCompanyCookie(c);
  }

  return c.json({ success: true as const }, 200);
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
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
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

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const { companyId } = SelectCompanySchema.parse(await c.req.json());

  const company = await prisma.company.findFirst({
    where: { id: companyId, organizationId },
  });

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  setActiveCompanyCookie(c, company.id);

  return c.json(
    {
      company: toCompanyResponse(company),
      activeCompanyId: company.id,
    },
    200,
  );
};
