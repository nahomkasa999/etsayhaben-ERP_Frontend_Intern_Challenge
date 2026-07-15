import prisma from "@/lib/db";
import { slugify } from "@/shared/lib/slug";

export class CompanyServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CompanyServiceError";
    this.status = status;
  }
}

async function ensureUniqueSlug(organizationId: string, baseSlug: string) {
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

export async function listCompanies(organizationId: string) {
  return prisma.company.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCompanyForOrganization(
  organizationId: string,
  companyId: string,
) {
  return prisma.company.findFirst({
    where: { id: companyId, organizationId },
  });
}

export async function createCompany(
  organizationId: string,
  input: { name: string; slug?: string },
) {
  const name = input.name.trim();

  if (!name) {
    throw new CompanyServiceError("Company name is required");
  }

  const baseSlug = slugify(input.slug?.trim() || name);

  if (!baseSlug) {
    throw new CompanyServiceError("Company slug could not be generated");
  }

  const slug = await ensureUniqueSlug(organizationId, baseSlug);

  return prisma.company.create({
    data: {
      organizationId,
      name,
      slug,
    },
  });
}

export async function updateCompany(
  organizationId: string,
  companyId: string,
  input: { name?: string; slug?: string },
) {
  const company = await getCompanyForOrganization(organizationId, companyId);

  if (!company) {
    throw new CompanyServiceError("Company not found", 404);
  }

  const data: { name?: string; slug?: string } = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new CompanyServiceError("Company name is required");
    }
    data.name = name;
  }

  if (input.slug !== undefined) {
    const slug = slugify(input.slug.trim());
    if (!slug) {
      throw new CompanyServiceError("Company slug is required");
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
      throw new CompanyServiceError("Company slug is already taken");
    }

    data.slug = slug;
  }

  return prisma.company.update({
    where: { id: companyId },
    data,
  });
}

export async function deleteCompany(organizationId: string, companyId: string) {
  const company = await getCompanyForOrganization(organizationId, companyId);

  if (!company) {
    throw new CompanyServiceError("Company not found", 404);
  }

  await prisma.company.delete({
    where: { id: companyId },
  });
}
