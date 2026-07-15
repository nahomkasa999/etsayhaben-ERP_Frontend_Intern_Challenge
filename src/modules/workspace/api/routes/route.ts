import { createRoute, z } from "@hono/zod-openapi";
import { APIError } from "better-auth/api";
import { setCookie } from "hono/cookie";
import type { Context } from "hono";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ACTIVE_COMPANY_COOKIE } from "@/modules/company/constants";
import { slugify } from "@/shared/lib/slug";
import type { AppVariables } from "@/app/api/types/context";
import {
  CreateWorkspaceSchema,
  OrganizationsListResponseSchema,
  SetActiveWorkspaceResponseSchema,
  SetActiveWorkspaceSchema,
  WorkspaceSchema,
} from "@/modules/workspace/types";

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("OrganizationErrorResponse");

type OrganizationEnv = { Variables: AppVariables };

function toCompanySummary(company: {
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

function toWorkspaceResponse(organization: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  companies?: {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  _count?: {
    companies: number;
  };
}) {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo,
    createdAt: organization.createdAt.toISOString(),
    companyCount: organization._count?.companies ?? organization.companies?.length ?? 0,
    companies: (organization.companies ?? []).map(toCompanySummary),
  };
}

async function ensureUniqueOrganizationSlug(baseSlug: string) {
  const slug = baseSlug || "workspace";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.organization.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
  }
}

export const listOrganizationsRoute = createRoute({
  method: "get",
  path: "/organizations",
  tags: ["Organizations"],
  summary: "List organizations for the current user",
  responses: {
    200: {
      description: "Organizations list",
      content: {
        "application/json": {
          schema: OrganizationsListResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

export const listOrganizationsHandler = async (c: Context<OrganizationEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      companies: {
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          companies: true,
        },
      },
    },
  });

  return c.json(
    {
      organizations: organizations.map(toWorkspaceResponse),
      activeOrganizationId: session.activeOrganizationId ?? null,
    },
    200,
  );
};

export const createOrganizationRoute = createRoute({
  method: "post",
  path: "/organizations",
  tags: ["Organizations"],
  summary: "Create an organization for the current user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateWorkspaceSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Organization created",
      content: {
        "application/json": {
          schema: WorkspaceSchema,
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
  },
});

export const createOrganizationHandler = async (c: Context<OrganizationEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = CreateWorkspaceSchema.parse(await c.req.json());
  const name = body.name.trim();

  if (!name) {
    return c.json({ error: "Organization name is required" }, 400);
  }

  const baseSlug = slugify(body.slug?.trim() || name);

  if (!baseSlug) {
    return c.json({ error: "Organization slug could not be generated" }, 400);
  }

  const slug = await ensureUniqueOrganizationSlug(baseSlug);

  try {
    const organization = await auth.api.createOrganization({
      body: {
        name,
        slug,
        logo: body.logo ?? null,
        keepCurrentActiveOrganization: false,
      },
      headers: c.req.raw.headers,
    });

    if (!organization) {
      return c.json({ error: "Failed to create organization" }, 400);
    }

    return c.json(
      {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo ?? null,
        createdAt: organization.createdAt.toISOString(),
        companyCount: 0,
        companies: [],
      },
      201,
    );
  } catch (error) {
    if (error instanceof APIError) {
      return c.json({ error: error.message }, error.statusCode as 400);
    }
    throw error;
  }
};

export const setActiveOrganizationRoute = createRoute({
  method: "post",
  path: "/organizations/set-active",
  tags: ["Organizations"],
  summary: "Set the active organization for the current session",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SetActiveWorkspaceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Active organization updated",
      content: {
        "application/json": {
          schema: SetActiveWorkspaceResponseSchema,
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

export const setActiveOrganizationHandler = async (
  c: Context<OrganizationEnv>,
) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { organizationId } = SetActiveWorkspaceSchema.parse(await c.req.json());

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    await auth.api.setActiveOrganization({
      body: {
        organizationId,
      },
      headers: c.req.raw.headers,
    });

    setCookie(c, ACTIVE_COMPANY_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 0,
    });

    return c.json({ activeOrganizationId: organizationId }, 200);
  } catch (error) {
    if (error instanceof APIError) {
      return c.json({ error: error.message }, error.statusCode as 400);
    }
    throw error;
  }
};
