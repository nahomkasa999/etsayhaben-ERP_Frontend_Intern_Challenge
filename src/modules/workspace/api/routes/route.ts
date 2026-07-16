import { createRoute, z } from "@hono/zod-openapi";
import { APIError } from "better-auth/api";
import { setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ACTIVE_COMPANY_COOKIE } from "@/modules/company/types/constants";
import { slugify } from "@/shared/lib/slug";
import type { AppVariables } from "@/app/api/types/context";
import {
  CreateWorkspaceSchema,
  OrganizationsListResponseSchema,
  SetActiveWorkspaceResponseSchema,
  SetActiveWorkspaceSchema,
  WorkspaceSchema,
} from "@/modules/workspace/types";
import {
  ensureUniqueOrganizationSlug,
  listOrganizations,
  WorkspaceRepositoryError,
} from "./workspaceRepository"

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("OrganizationErrorResponse");

const authErrorResponses = {
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
} as const;

type OrganizationEnv = { Variables: AppVariables };

function repositoryErrorResponse(
  c: Context<OrganizationEnv>,
  error: WorkspaceRepositoryError,
  status: ContentfulStatusCode,
) {
  return c.json({ error: error.message }, status);
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
    ...authErrorResponses,
  },
});

export const listOrganizationsHandler = async (c: Context<OrganizationEnv>) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const organizations = await listOrganizations(user.id);

    return c.json(
      {
        organizations,
        activeOrganizationId: session.activeOrganizationId ?? null,
      },
      200,
    );
  } catch (error) {
    if (error instanceof WorkspaceRepositoryError) {
      return repositoryErrorResponse(c, error, 400);
    }
    throw error;
  }
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
    ...authErrorResponses,
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
      },
      201,
    );
  } catch (error) {
    if (error instanceof APIError) {
      return c.json({ error: error.message }, (error.statusCode as 400 | 401 | 403 | 404) ?? 400);
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
    ...authErrorResponses,
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
      return c.json({ error: error.message }, (error.statusCode as 400 | 401 | 403 | 404) ?? 400);
    }
    throw error;
  }
};
