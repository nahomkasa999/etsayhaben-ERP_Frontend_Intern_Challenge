import type { Company as PrismaCompany, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../types";

export class CompanyRepositoryError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CompanyRepositoryError";
    this.status = status;
  }
}

function toCompanyDto(record: PrismaCompany): Company {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    slug: record.slug,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listCompanies(organizationId: string): Promise<Company[]> {
  const companies = await prisma.company.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });

  return companies.map(toCompanyDto);
}

export async function getCompanyById(
  id: string,
  organizationId: string,
): Promise<Company> {
  const company = await prisma.company.findFirst({
    where: { id, organizationId },
  });

  if (!company) {
    throw new CompanyRepositoryError("Company not found", 404);
  }

  return toCompanyDto(company);
}

export async function ensureUniqueCompanySlug(
  organizationId: string,
  baseSlug: string,
): Promise<string> {
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

export async function createCompany(
  organizationId: string,
  name: string,
  slug: string,
): Promise<Company> {
  const company = await prisma.company.create({
    data: {
      organizationId,
      name,
      slug,
    },
  });

  return toCompanyDto(company);
}

export async function updateCompany(
  id: string,
  organizationId: string,
  data: { name?: string; slug?: string },
): Promise<Company> {
  const existing = await prisma.company.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new CompanyRepositoryError("Company not found", 404);
  }

  const updated = await prisma.company.update({
    where: { id },
    data,
  });

  return toCompanyDto(updated);
}

export async function deleteCompany(
  id: string,
  organizationId: string,
): Promise<void> {
  const existing = await prisma.company.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new CompanyRepositoryError("Company not found", 404);
  }

  await prisma.company.delete({ where: { id } });
}

export async function checkSlugExists(
  organizationId: string,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const where: Record<string, unknown> = {
    organizationId,
    slug,
  };

  if (excludeId) {
    where.NOT = { id: excludeId };
  }

  const existing = await prisma.company.findFirst({
    where: where as Prisma.CompanyWhereInput,
    select: { id: true },
  });

  return !!existing;
}
