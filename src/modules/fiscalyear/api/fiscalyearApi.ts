import { deriveFiscalYearDates } from "../services/convertCalender";

import {
  ActivateFiscalYearParams,
  ActiveFiscalYearResponse,
  ActivateFiscalYearResponse,
  CreateFiscalYearRequestBase,
  FiscalYear,
  FiscalYearByDateParams,
  FiscalYearList,
  FiscalYearListResponse,
  ListFiscalYearsParams,
  UpdateFiscalYearParams,
  UpdateFiscalYearResponse,
  CloseFiscalYearParams,
  CloseFiscalYearResponse,
  ReopenFiscalYearParams,
  ReopenFiscalYearResponse,
  DeleteFiscalYearParams,
  FiscalYearApiError,
} from "../types";

import SEED_DATA from "./SeedStore";

const STORAGE_KEY = "FiscalYearDB";
const MAX_OPEN_FISCAL_YEARS = 2;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeFiscalYear(fy: FiscalYear & { reopen_expires_at?: string }): FiscalYear {
  const { reopen_expires_at: _expired, ...rest } = fy;
  return {
    ...rest,
    is_active: fy.is_active ?? false,
  };
}

function readDb(): FiscalYear[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }

  const parsed = JSON.parse(raw) as Array<FiscalYear & { reopen_expires_at?: string }>;
  return parsed.map(normalizeFiscalYear);
}

function writeDb(fiscalYears: FiscalYear[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fiscalYears));
}

function getFiscalYearsForCompany(
  tenant_id: string,
  company_id: string,
): FiscalYear[] {
  const fiscalYears = readDb();
  return fiscalYears.filter(
    (fy) => fy.tenant_id === tenant_id && fy.company_id === company_id,
  );
}

function countByStatus(
  fiscalYears: FiscalYear[],
  status: FiscalYear["status"],
): number {
  return fiscalYears.filter((fy) => fy.status === status).length;
}

function deactivateOthers(
  fiscalYears: FiscalYear[],
  tenant_id: string,
  company_id: string,
  exceptId: string,
): void {
  for (let i = 0; i < fiscalYears.length; i++) {
    const fy = fiscalYears[i];
    if (
      fy.tenant_id === tenant_id &&
      fy.company_id === company_id &&
      fy.id !== exceptId &&
      fy.is_active
    ) {
      fiscalYears[i] = { ...fy, is_active: false };
    }
  }
}

/** If a company has fiscal years but none active, activate the sole OPEN/REOPENED one. */
function autoActivateSoleFiscalYear(
  tenant_id: string,
  company_id: string,
  activated_by = "SYSTEM",
): void {
  const fiscalYears = readDb();
  const companyFys = fiscalYears.filter(
    (fy) => fy.tenant_id === tenant_id && fy.company_id === company_id,
  );
  if (companyFys.length === 0) return;
  if (companyFys.some((fy) => fy.is_active)) return;

  const candidates = companyFys.filter(
    (fy) => fy.status === "OPEN" || fy.status === "REOPENED",
  );
  if (candidates.length !== 1) return;

  const index = fiscalYears.findIndex((fy) => fy.id === candidates[0].id);
  if (index === -1) return;

  fiscalYears[index] = {
    ...fiscalYears[index],
    is_active: true,
    activated_by,
    activated_at: new Date().toISOString(),
  };
  writeDb(fiscalYears);
}

function toListItem(fy: FiscalYear): FiscalYearList {
  return {
    id: fy.id,
    fiscal_year_name: fy.fiscal_year_name,
    status: fy.status,
    is_active: fy.is_active,
    start_date_eth: fy.start_date_eth,
    end_date_eth: fy.end_date_eth,
    start_date_gre: fy.start_date_gre,
    end_date_gre: fy.end_date_gre,
  };
}

export async function CreateFiscalYear(
  request: CreateFiscalYearRequestBase,
): Promise<FiscalYear> {
  await delay(400);

  const companyFys = getFiscalYearsForCompany(
    request.tenant_id,
    request.company_id,
  );

  if (countByStatus(companyFys, "OPEN") >= MAX_OPEN_FISCAL_YEARS) {
    throw new FiscalYearApiError(
      "Maximum of two OPEN fiscal years allowed at a time.",
      409,
    );
  }

  const fiscalYears = readDb();
  const derivedDates = deriveFiscalYearDates(
    request.calendar_type,
    request.start_date,
    request.end_date,
  );
  const { start_date: _start, end_date: _end, ...requestRest } = request;
  const isFirst = companyFys.length === 0;
  const now = new Date().toISOString();
  const newFiscalYear: FiscalYear = {
    ...requestRest,
    ...derivedDates,
    id: crypto.randomUUID(),
    status: "OPEN",
    is_active: isFirst,
    created_at: now,
    updated_at: now,
    ...(isFirst
      ? { activated_by: request.created_by, activated_at: now }
      : {}),
  };
  writeDb([newFiscalYear, ...fiscalYears]);

  return newFiscalYear;
}

//Read Single Fiscal Year
export async function fetchFiscalYearById(
  id: string,
  params: ListFiscalYearsParams,
): Promise<FiscalYear> {
  await delay(400);
  const fiscalYears = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );
  const fiscalYear = fiscalYears.find((fy) => fy.id === id);

  if (!fiscalYear) {
    throw new FiscalYearApiError("No fiscal year found for the given id.", 404);
  }

  return fiscalYear;
}

//Read Fiscal Years,
export async function fetchFiscalYearLists(
  params: ListFiscalYearsParams,
): Promise<FiscalYearListResponse> {
  await delay(400);
  autoActivateSoleFiscalYear(params.tenant_id, params.company_id);
  const fiscalYears = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );

  return {
    count: fiscalYears.length,
    results: fiscalYears.map(toListItem),
  };
}

export async function GetActiveFiscalYear(
  params: ListFiscalYearsParams,
): Promise<ActiveFiscalYearResponse> {
  await delay(400);
  const fiscalYears = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );
  const active = fiscalYears.find((fy) => fy.is_active);
  if (!active) {
    throw new FiscalYearApiError("No active fiscal year found.", 404);
  }
  return active;
}

export async function GetFiscalYearByDate(
  params: FiscalYearByDateParams,
): Promise<FiscalYearList> {
  await delay(400);
  const fiscalYears: FiscalYear[] = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );
  const date = params.date;
  const calendar_type = params.calendar_type;
  const result = fiscalYears.find((fy) => {
    if (calendar_type === "ETHIOPIAN") {
      return fy.start_date_eth <= date && fy.end_date_eth >= date;
    }
    return fy.start_date_gre <= date && fy.end_date_gre >= date;
  });

  if (!result) {
    throw new FiscalYearApiError(
      "No fiscal year found for the given date.",
      404,
    );
  }

  return toListItem(result);
}

//update Fiscal Year
export async function UpdateFiscalYear({
  id,
  updated_by,
  params,
}: UpdateFiscalYearParams): Promise<UpdateFiscalYearResponse> {
  await delay(400);

  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    throw new FiscalYearApiError("No fiscal year found for the given id.", 404);
  }

  const existing = fiscalYears[index];

  const derivedDates =
    params.start_date && params.end_date
      ? deriveFiscalYearDates(
          existing.calendar_type,
          params.start_date,
          params.end_date,
        )
      : {};

  const updated: FiscalYear = {
    ...existing,
    ...derivedDates,
    fiscal_year_name: params.fiscal_year_name ?? existing.fiscal_year_name,
    updated_by,
    updated_at: new Date().toISOString(),
  };

  fiscalYears[index] = updated;
  writeDb(fiscalYears);

  const result: UpdateFiscalYearResponse = {
    id: updated.id,
    fiscal_year_name: updated.fiscal_year_name,
    start_date_eth: updated.start_date_eth,
    end_date_eth: updated.end_date_eth,
    status: updated.status,
    updated_by: updated.updated_by!,
    updated_at: updated.updated_at,
  };

  return result;
}

export async function ActivateFiscalYear({
  id,
  activated_by,
  params,
}: ActivateFiscalYearParams): Promise<ActivateFiscalYearResponse> {
  await delay(400);
  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    throw new FiscalYearApiError("No fiscal year found for the given id.", 404);
  }

  const existing = fiscalYears[index];

  if (existing.status !== "OPEN" && existing.status !== "REOPENED") {
    throw new FiscalYearApiError(
      "Only OPEN or REOPENED fiscal years can be activated.",
      409,
    );
  }

  if (existing.is_active) {
    throw new FiscalYearApiError("Fiscal year is already active.", 409);
  }

  deactivateOthers(fiscalYears, params.tenant_id, params.company_id, id);

  const updated: FiscalYear = {
    ...existing,
    is_active: true,
    activated_by,
    activated_at: new Date().toISOString(),
  };
  fiscalYears[index] = updated;
  writeDb(fiscalYears);
  return {
    id,
    status: updated.status,
    is_active: true,
    activated_by,
    activated_at: updated.activated_at!,
  };
}

export async function CloseFiscalYear({
  id,
  closed_by,
  params,
}: CloseFiscalYearParams): Promise<CloseFiscalYearResponse> {
  await delay(400);
  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    throw new FiscalYearApiError("No fiscal year found for the given id.", 404);
  }

  const existing = fiscalYears[index];
  if (existing.status === "CLOSED") {
    throw new FiscalYearApiError("Fiscal year is already Closed.", 409);
  }

  const companyFys = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );
  if (companyFys.length === 1 && !params.bypassSoleCheck) {
    throw new FiscalYearApiError(
      "Cannot close the only fiscal year. There must always be at least one active fiscal year.",
      409,
    );
  }

  const updated: FiscalYear = {
    ...existing,
    status: "CLOSED",
    is_active: false,
    closed_by,
    closed_at: new Date().toISOString(),
    justification: params.justification,
  };
  fiscalYears[index] = updated;
  writeDb(fiscalYears);

  autoActivateSoleFiscalYear(params.tenant_id, params.company_id);

  return {
    id,
    status: "CLOSED",
    closed_by,
    closed_at: updated.closed_at!,
    justification: params.justification,
  };
}

export async function ReopenFiscalYear({
  id,
  reopened_by,
  params,
}: ReopenFiscalYearParams): Promise<ReopenFiscalYearResponse> {
  await delay(400);
  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    throw new FiscalYearApiError("No fiscal year found for the given id.", 404);
  }

  const existing = fiscalYears[index];
  if (existing.status !== "CLOSED") {
    throw new FiscalYearApiError(
      "Only CLOSED fiscal years can be reopened.",
      409,
    );
  }

  if (existing.reopened_at) {
    throw new FiscalYearApiError(
      "This fiscal year has already been reopened once and cannot be reopened again.",
      409,
    );
  }

  const companyFys = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );
  if (countByStatus(companyFys, "REOPENED") >= 1) {
    throw new FiscalYearApiError(
      "Only one REOPENED fiscal year is allowed at a time.",
      409,
    );
  }

  const updated: FiscalYear = {
    ...existing,
    status: "REOPENED",
    reopened_by,
    reopened_at: new Date().toISOString(),
    justification: params.justification,
  };
  fiscalYears[index] = updated;
  writeDb(fiscalYears);

  return {
    id,
    status: "REOPENED",
    reopened_by,
    reopened_at: updated.reopened_at!,
    justification: params.justification,
  };
}

export async function DeleteFiscalYear({
  id,
  deleted_by,
  params,
}: DeleteFiscalYearParams): Promise<Record<string, string>> {
  await delay(400);
  const fiscalYears = readDb();

  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    throw new FiscalYearApiError("No fiscal year found for the given id.", 404);
  }

  const remaining = fiscalYears.filter((fy) => fy.id !== id);
  writeDb(remaining);
  autoActivateSoleFiscalYear(params.tenant_id, params.company_id);

  return { detail: "Deleted fiscal year." };
}
