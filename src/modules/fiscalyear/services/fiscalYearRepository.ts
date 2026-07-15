import type { FiscalYear as PrismaFiscalYear } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { deriveFiscalYearDates } from "./convertCalender";
import type {
  ActivateFiscalYearResponse,
  CloseFiscalYearResponse,
  CreateFiscalYearInput,
  FiscalYear,
  FiscalYearList,
  FiscalYearListResponse,
  ReopenFiscalYearResponse,
  UpdateFiscalYearInput,
  UpdateFiscalYearResponse,
} from "../types";

export class FiscalYearRepositoryError extends Error {
  status: number;

  constructor(detail: string, status = 400) {
    super(detail);
    this.name = "FiscalYearRepositoryError";
    this.status = status;
  }
}

function toIso(value: Date | null | undefined) {
  return value?.toISOString();
}

function toFiscalYearDto(record: PrismaFiscalYear): FiscalYear {
  return {
    id: record.id,
    tenant_id: record.tenant_id,
    company_id: record.company_id,
    fiscal_year_name: record.fiscal_year_name,
    calendar_type: record.calendar_type,
    start_date_eth: record.start_date_eth,
    start_date_gre: record.start_date_gre,
    end_date_eth: record.end_date_eth,
    end_date_gre: record.end_date_gre,
    status: record.status,
    is_active: record.is_Active,
    created_by: record.created_by,
    created_at: record.created_at.toISOString(),
    updated_at: record.updated_at.toISOString(),
    activated_by: record.activated_by ?? undefined,
    activated_at: toIso(record.activated_at),
    updated_by: record.updated_by ?? undefined,
    closed_by: record.closed_by ?? undefined,
    closed_at: toIso(record.closed_at),
    reopened_by: record.reopened_by ?? undefined,
    reopened_at: toIso(record.reopened_at),
    reopen_expires_at: toIso(record.reopen_expires_at),
    justification: record.justification ?? undefined,
  };
}

function toListItem(record: PrismaFiscalYear): FiscalYearList {
  return {
    id: record.id,
    fiscal_year_name: record.fiscal_year_name,
    status: record.status,
    start_date_eth: record.start_date_eth,
    end_date_eth: record.end_date_eth,
    start_date_gre: record.start_date_gre,
    end_date_gre: record.end_date_gre,
    is_active: record.is_Active,
  };
}

async function normalizeActiveFlags(
  tenantId: string,
  companyId: string,
): Promise<PrismaFiscalYear[]> {
  const fiscalYears = await prisma.fiscalYear.findMany({
    where: { tenant_id: tenantId, company_id: companyId },
    orderBy: { created_at: "desc" },
  });

  const selectedByCompany = new Map<string, string>();

  for (const fiscalYear of fiscalYears) {
    if (
      fiscalYear.is_Active !== true ||
      !["OPEN", "REOPENED"].includes(fiscalYear.status)
    ) {
      continue;
    }

    const companyKey = `${fiscalYear.tenant_id}:${fiscalYear.company_id}`;
    if (!selectedByCompany.has(companyKey)) {
      selectedByCompany.set(companyKey, fiscalYear.id);
    }
  }

  for (const fiscalYear of fiscalYears) {
    const companyKey = `${fiscalYear.tenant_id}:${fiscalYear.company_id}`;
    if (
      !selectedByCompany.has(companyKey) &&
      fiscalYear.activated_at &&
      ["OPEN", "REOPENED"].includes(fiscalYear.status)
    ) {
      selectedByCompany.set(companyKey, fiscalYear.id);
    }
  }

  const updates: Promise<unknown>[] = [];

  for (const fiscalYear of fiscalYears) {
    const companyKey = `${fiscalYear.tenant_id}:${fiscalYear.company_id}`;
    const shouldBeActive = selectedByCompany.get(companyKey) === fiscalYear.id;

    if (fiscalYear.is_Active !== shouldBeActive) {
      updates.push(
        prisma.fiscalYear.update({
          where: { id: fiscalYear.id },
          data: { is_Active: shouldBeActive },
        }),
      );
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
    return prisma.fiscalYear.findMany({
      where: { tenant_id: tenantId, company_id: companyId },
      orderBy: { created_at: "desc" },
    });
  }

  return fiscalYears;
}

async function getCompanyFiscalYears(tenantId: string, companyId: string) {
  return normalizeActiveFlags(tenantId, companyId);
}

export async function listFiscalYears(
  tenantId: string,
  companyId: string,
): Promise<FiscalYearListResponse> {
  const fiscalYears = await getCompanyFiscalYears(tenantId, companyId);

  return {
    count: fiscalYears.length,
    results: fiscalYears.map(toListItem),
  };
}

export async function getFiscalYearById(
  id: string,
  tenantId: string,
  companyId: string,
): Promise<FiscalYear> {
  const fiscalYears = await getCompanyFiscalYears(tenantId, companyId);
  const fiscalYear = fiscalYears.find((fy) => fy.id === id);

  if (!fiscalYear) {
    throw new FiscalYearRepositoryError(
      "No fiscal year found for the given id.",
      404,
    );
  }

  return toFiscalYearDto(fiscalYear);
}

export async function getActiveFiscalYear(
  tenantId: string,
  companyId: string,
): Promise<FiscalYear> {
  const fiscalYears = await getCompanyFiscalYears(tenantId, companyId);
  const active = fiscalYears.find((fy) => fy.is_Active);

  if (!active) {
    throw new FiscalYearRepositoryError("No active fiscal year found.", 404);
  }

  return toFiscalYearDto(active);
}

export async function getFiscalYearByDate(
  tenantId: string,
  companyId: string,
  date: string,
  calendarType: "ETHIOPIAN" | "GREGORIAN",
): Promise<FiscalYearList> {
  const fiscalYears = await getCompanyFiscalYears(tenantId, companyId);
  const result = fiscalYears.find((fy) => {
    if (calendarType === "ETHIOPIAN") {
      return (
        fy.status === "OPEN" &&
        fy.start_date_eth <= date &&
        fy.end_date_eth >= date
      );
    }

    return (
      fy.status === "OPEN" &&
      fy.start_date_gre <= date &&
      fy.end_date_gre >= date
    );
  });

  if (!result) {
    throw new FiscalYearRepositoryError(
      "No fiscal year found for the given date.",
      404,
    );
  }

  return toListItem(result);
}

export async function createFiscalYear(
  tenantId: string,
  companyId: string,
  createdBy: string,
  input: CreateFiscalYearInput,
): Promise<FiscalYear> {
  if (new Date(input.start_date) >= new Date(input.end_date)) {
    throw new FiscalYearRepositoryError("start_date must be before end_date.", 422);
  }

  const existingCount = await prisma.fiscalYear.count({
    where: { tenant_id: tenantId, company_id: companyId },
  });
  const isFirstFiscalYear = existingCount === 0;
  const derivedDates = deriveFiscalYearDates(
    input.calendar_type,
    input.start_date,
    input.end_date,
  );
  const now = new Date();

  const created = await prisma.fiscalYear.create({
    data: {
      tenant_id: tenantId,
      company_id: companyId,
      fiscal_year_name: input.fiscal_year_name,
      calendar_type: input.calendar_type,
      ...derivedDates,
      status: "OPEN",
      is_Active: isFirstFiscalYear,
      created_by: createdBy,
      ...(isFirstFiscalYear
        ? {
            activated_by: createdBy,
            activated_at: now,
          }
        : {}),
    },
  });

  return toFiscalYearDto(created);
}

export async function updateFiscalYear(
  id: string,
  tenantId: string,
  companyId: string,
  updatedBy: string,
  input: UpdateFiscalYearInput,
): Promise<UpdateFiscalYearResponse> {
  const existing = await prisma.fiscalYear.findFirst({
    where: { id, tenant_id: tenantId, company_id: companyId },
  });

  if (!existing) {
    throw new FiscalYearRepositoryError(
      "No fiscal year found for the given id.",
      404,
    );
  }

  const derivedDates =
    input.start_date && input.end_date
      ? deriveFiscalYearDates(
          existing.calendar_type,
          input.start_date,
          input.end_date,
        )
      : {};

  const updated = await prisma.fiscalYear.update({
    where: { id },
    data: {
      ...derivedDates,
      fiscal_year_name: input.fiscal_year_name ?? existing.fiscal_year_name,
      updated_by: updatedBy,
    },
  });

  return {
    id: updated.id,
    fiscal_year_name: updated.fiscal_year_name,
    start_date_eth: updated.start_date_eth,
    end_date_eth: updated.end_date_eth,
    status: updated.status,
    updated_by: updated.updated_by!,
    updated_at: updated.updated_at.toISOString(),
  };
}

export async function activateFiscalYear(
  id: string,
  tenantId: string,
  companyId: string,
  activatedBy: string,
): Promise<ActivateFiscalYearResponse> {
  const existing = await prisma.fiscalYear.findFirst({
    where: { id, tenant_id: tenantId, company_id: companyId },
  });

  if (!existing) {
    throw new FiscalYearRepositoryError(
      "No fiscal year found for the given id.",
      404,
    );
  }

  if (existing.is_Active) {
    throw new FiscalYearRepositoryError("Fiscal year is already active.", 409);
  }

  if (existing.status === "CLOSED") {
    throw new FiscalYearRepositoryError(
      "Only open or reopened fiscal years can be activated.",
      409,
    );
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.fiscalYear.updateMany({
      where: { tenant_id: tenantId, company_id: companyId },
      data: { is_Active: false },
    }),
    prisma.fiscalYear.update({
      where: { id },
      data: {
        is_Active: true,
        activated_by: activatedBy,
        activated_at: now,
      },
    }),
  ]);

  return {
    id,
    status: existing.status,
    is_active: true,
    activated_by: activatedBy,
    activated_at: now.toISOString(),
  };
}

export async function closeFiscalYear(
  id: string,
  tenantId: string,
  companyId: string,
  closedBy: string,
  justification: string,
): Promise<CloseFiscalYearResponse> {
  const existing = await prisma.fiscalYear.findFirst({
    where: { id, tenant_id: tenantId, company_id: companyId },
  });

  if (!existing) {
    throw new FiscalYearRepositoryError(
      "No fiscal year found for the given id.",
      404,
    );
  }

  if (existing.status === "CLOSED") {
    throw new FiscalYearRepositoryError("Fiscal year is already Closed.", 409);
  }

  const now = new Date();
  const updated = await prisma.fiscalYear.update({
    where: { id },
    data: {
      status: "CLOSED",
      is_Active: false,
      closed_by: closedBy,
      closed_at: now,
      justification,
    },
  });

  return {
    id,
    status: "CLOSED",
    closed_by: closedBy,
    closed_at: updated.closed_at!.toISOString(),
    justification,
  };
}

export async function reopenFiscalYear(
  id: string,
  tenantId: string,
  companyId: string,
  reopenedBy: string,
  justification: string,
): Promise<ReopenFiscalYearResponse> {
  const existing = await prisma.fiscalYear.findFirst({
    where: { id, tenant_id: tenantId, company_id: companyId },
  });

  if (!existing) {
    throw new FiscalYearRepositoryError(
      "No fiscal year found for the given id.",
      404,
    );
  }

  if (existing.status === "REOPENED") {
    throw new FiscalYearRepositoryError("Fiscal year is already Reopened.", 409);
  }

  if (existing.reopened_at) {
    throw new FiscalYearRepositoryError(
      "This fiscal year has already been reopened once and cannot be reopened again.",
      409,
    );
  }

  const now = new Date();
  const reopenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const updated = await prisma.fiscalYear.update({
    where: { id },
    data: {
      status: "REOPENED",
      reopened_by: reopenedBy,
      reopened_at: now,
      reopen_expires_at: reopenExpiresAt,
      justification,
    },
  });

  return {
    id,
    status: "REOPENED",
    reopened_by: reopenedBy,
    reopened_at: updated.reopened_at!.toISOString(),
    reopen_expires_at: updated.reopen_expires_at!.toISOString(),
    justification,
  };
}

export async function deleteFiscalYear(
  id: string,
  tenantId: string,
  companyId: string,
): Promise<{ detail: string }> {
  const existing = await prisma.fiscalYear.findFirst({
    where: { id, tenant_id: tenantId, company_id: companyId },
  });

  if (!existing) {
    throw new FiscalYearRepositoryError(
      "No fiscal year found for the given id.",
      404,
    );
  }

  await prisma.fiscalYear.delete({ where: { id } });

  return { detail: "Deleted fiscal year." };
}
