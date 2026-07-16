import type { FiscalYear as PrismaFiscalYear } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { deriveFiscalYearDates } from "../../services/convertCalendar";
import type {
  ActivateFiscalYearResponse,
  CloseFiscalYearResponse,
  CreateFiscalYearInput,
  FiscalYear,
  FiscalYearListItem,
  ReopenFiscalYearResponse,
  UpdateFiscalYearInput,
  UpdateFiscalYearResponse,
} from "../../types";

export class FiscalYearRepositoryError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
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
    tenantId: record.tenant_id,
    companyId: record.company_id,
    fiscalYearName: record.fiscal_year_name,
    calendarType: record.calendar_type,
    startDateEth: record.start_date_eth,
    startDateGre: record.start_date_gre,
    endDateEth: record.end_date_eth,
    endDateGre: record.end_date_gre,
    status: record.status,
    isActive: record.is_Active,
    createdBy: record.created_by,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
    activatedBy: record.activated_by ?? undefined,
    activatedAt: toIso(record.activated_at),
    updatedBy: record.updated_by ?? undefined,
    closedBy: record.closed_by ?? undefined,
    closedAt: toIso(record.closed_at),
    reopenedBy: record.reopened_by ?? undefined,
    reopenedAt: toIso(record.reopened_at),
    reopenExpiresAt: toIso(record.reopen_expires_at),
    justification: record.justification ?? undefined,
  };
}

function toListItem(record: PrismaFiscalYear): FiscalYearListItem {
  return {
    id: record.id,
    fiscalYearName: record.fiscal_year_name,
    status: record.status,
    startDateEth: record.start_date_eth,
    endDateEth: record.end_date_eth,
    startDateGre: record.start_date_gre,
    endDateGre: record.end_date_gre,
    isActive: record.is_Active,
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
): Promise<FiscalYearListItem[]> {
  const fiscalYears = await getCompanyFiscalYears(tenantId, companyId);
  return fiscalYears.map(toListItem);
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
      "Fiscal year not found",
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
): Promise<FiscalYearListItem> {
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
  if (new Date(input.startDate) >= new Date(input.endDate)) {
    throw new FiscalYearRepositoryError("Start date must be before end date.", 400);
  }

  const existingCount = await prisma.fiscalYear.count({
    where: { tenant_id: tenantId, company_id: companyId },
  });
  const isFirstFiscalYear = existingCount === 0;
  const derivedDates = deriveFiscalYearDates(
    input.calendarType,
    input.startDate,
    input.endDate,
  );
  const now = new Date();

  const created = await prisma.fiscalYear.create({
    data: {
      tenant_id: tenantId,
      company_id: companyId,
      fiscal_year_name: input.fiscalYearName,
      calendar_type: input.calendarType,
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
      "Fiscal year not found",
      404,
    );
  }

  const derivedDates =
    input.startDate && input.endDate
      ? deriveFiscalYearDates(
          existing.calendar_type,
          input.startDate,
          input.endDate,
        )
      : {};

  const updated = await prisma.fiscalYear.update({
    where: { id },
    data: {
      ...derivedDates,
      fiscal_year_name: input.fiscalYearName ?? existing.fiscal_year_name,
      updated_by: updatedBy,
    },
  });

  return {
    id: updated.id,
    fiscalYearName: updated.fiscal_year_name,
    startDateEth: updated.start_date_eth,
    endDateEth: updated.end_date_eth,
    status: updated.status,
    updatedBy: updated.updated_by!,
    updatedAt: updated.updated_at.toISOString(),
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
      "Fiscal year not found",
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
    isActive: true,
    activatedBy,
    activatedAt: now.toISOString(),
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
      "Fiscal year not found",
      404,
    );
  }

  if (existing.status === "CLOSED") {
    throw new FiscalYearRepositoryError("Fiscal year is already closed.", 409);
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
    closedBy,
    closedAt: updated.closed_at!.toISOString(),
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
      "Fiscal year not found",
      404,
    );
  }

  if (existing.status === "REOPENED") {
    throw new FiscalYearRepositoryError("Fiscal year is already reopened.", 409);
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
    reopenedBy,
    reopenedAt: updated.reopened_at!.toISOString(),
    reopenExpiresAt: updated.reopen_expires_at!.toISOString(),
    justification,
  };
}

export async function deleteFiscalYear(
  id: string,
  tenantId: string,
  companyId: string,
): Promise<void> {
  const existing = await prisma.fiscalYear.findFirst({
    where: { id, tenant_id: tenantId, company_id: companyId },
  });

  if (!existing) {
    throw new FiscalYearRepositoryError(
      "Fiscal year not found",
      404,
    );
  }

  await prisma.fiscalYear.delete({ where: { id } });
}
