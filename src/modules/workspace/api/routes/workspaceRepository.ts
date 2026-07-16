import prisma from "@/lib/db";
import type {
  Workspace,
  WorkspaceWithCompanies,
} from "../../types";

export class WorkspaceRepositoryError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "WorkspaceRepositoryError";
    this.status = status;
  }
}

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
}): WorkspaceWithCompanies {
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

export async function listOrganizations(userId: string): Promise<WorkspaceWithCompanies[]> {
  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
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

  return organizations.map(toWorkspaceResponse);
}

export async function ensureUniqueOrganizationSlug(baseSlug: string): Promise<string> {
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
