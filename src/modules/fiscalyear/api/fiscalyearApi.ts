import { deriveFiscalYearDates } from "../services/convertCalender";

import {
  ActivateFiscalYearParams,
  ActiveFiscalYearResponse,
  ActivateFiscalYearResponse,
  CreateFiscalYearRequestBase,
  CreateFiscalYearResponse,
  FiscalYear,
  FiscalYearByDateParams,
  FiscalYearListResponse,
  ListFiscalYearsParams,
  UpdateFiscalYearParams,
  UpdateFiscalYearResponse,
  CloseFiscalYearParams,
  CloseFiscalYearResponse,
  ReopenFiscalYearParams,
  ReopenFiscalYearResponse,
  DeleteFiscalYearParams,
  DeleteFiscalYearResponse,
} from "../types";

import SEED_DATA from "./SeedStore";

const STORAGE_KEY = "FiscalYearDB";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readDb(): FiscalYear[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }

  return JSON.parse(raw);
}

function writeDb(fiscalYears: FiscalYear[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fiscalYears));
}

function getFiscalYearsForCompany(tenant_id: string, company_id: string) {
  const fiscalYears = readDb();
  return fiscalYears.filter(
    (fy) => fy.tenant_id === tenant_id && fy.company_id === company_id,
  );
}

export async function CreateFiscalYear(
  request: CreateFiscalYearRequestBase,
): Promise<CreateFiscalYearResponse | Record<string, string>> {
  await delay(400);

  if (new Date(request.start_date) >= new Date(request.end_date)) {
    return { detail: "start_date must be before end_date." };
  }

  const fiscalYears = readDb();
  const derivedDates = deriveFiscalYearDates(
    request.calendar_type,
    request.start_date,
    request.end_date,
  );
  const { start_date, end_date, ...requestRest } = request;
  const newFiscalYear: CreateFiscalYearResponse = {
    ...requestRest,
    ...derivedDates,
    id: crypto.randomUUID(),
    status: "OPEN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  writeDb([...fiscalYears, newFiscalYear]);

  return newFiscalYear;
}

//Read Fiscal Years,
export async function fetchFiscalYearLists(
  params: ListFiscalYearsParams,
): Promise<FiscalYearListResponse> {
  await delay(400);
  const fiscalYears = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );

  return {
    count: fiscalYears.length,
    results: fiscalYears.map((fy) => ({
      id: fy.id,
      fiscal_year_name: fy.fiscal_year_name,
      status: fy.status,
      start_date_eth: fy.start_date_eth,
      end_date_eth: fy.end_date_eth,
    })),
  };
}

export async function GetActiveFiscalYear(
  params: ListFiscalYearsParams,
): Promise<ActiveFiscalYearResponse[]> {
  await delay(400);
  const result = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  ).filter((fy) => fy.status === "OPEN");
  return result;
}

export async function GetFiscalYearByDate(
  params: FiscalYearByDateParams,
): Promise<ActiveFiscalYearResponse[] | Record<string, string>> {
  await delay(400);
  const fiscalYears: FiscalYear[] = getFiscalYearsForCompany(
    params.tenant_id,
    params.company_id,
  );
  const date = params.date;
  const calendar_type = params.calendar_type;
  const result = fiscalYears.filter((fy) => {
    if (calendar_type === "ETHIOPIAN") {
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

  if (result.length === 0) {
    return {
      detail: "No fiscal year found for the given date.",
    };
  }
  return result;
}

//update Fiscal Year
export async function UpdateFiscalYear({
  id,
  updated_by,
  params,
}: UpdateFiscalYearParams): Promise<
  UpdateFiscalYearResponse | Record<string, string>
> {
  await delay(400);

  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    return {
      detail: "No fiscal year found for the given id.",
    };
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
}: ActivateFiscalYearParams): Promise<
  ActivateFiscalYearResponse | Record<string, string>
> {
  await delay(400);
  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    return {
      detail: "No fiscal year found for the given id.",
    };
  }

  const existing = fiscalYears[index];

  if (existing.status === "OPEN") {
    return {
      detail: "Fiscal year is already Active.",
    };
  }
  const updated: FiscalYear = {
    ...existing,
    status: "OPEN",
    activated_by,
    activated_at: new Date().toISOString(),
  };
  fiscalYears[index] = updated;
  writeDb(fiscalYears);
  return {
    id,
    status: "OPEN",
    activated_by,
    activated_at: updated.activated_at!,
  };
}

export async function CloseFiscalYear({
  id,
  closed_by,
  params,
}: CloseFiscalYearParams): Promise<
  CloseFiscalYearResponse | Record<string, string>
> {
  await delay(400);
  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    return {
      detail: "No fiscal year found for the given id.",
    };
  }

  const existing = fiscalYears[index];
  if (existing.status === "CLOSED") {
    return {
      detail: "Fiscal year is already Closed.",
    };
  }
  const updated: FiscalYear = {
    ...existing,
    status: "CLOSED",
    closed_by,
    closed_at: new Date().toISOString(),
    justification: params.justification,
  };
  fiscalYears[index] = updated;
  writeDb(fiscalYears);
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
}: ReopenFiscalYearParams): Promise<
  ReopenFiscalYearResponse | Record<string, string>
> {
  await delay(400);
  const fiscalYears = readDb();
  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    return {
      detail: "No fiscal year found for the given id.",
    };
  }

  const existing = fiscalYears[index];
  if (existing.status === "REOPENED") {
    return {
      detail: "Fiscal year is already Reopened.",
    };
  }

  if (existing.reopened_at) {
    return {
      detail:
        "This fiscal year has already been reopened once and cannot be reopened again.",
    };
  }
  const updated: FiscalYear = {
    ...existing,
    status: "REOPENED",
    reopened_by,
    reopened_at: new Date().toISOString(),
    reopen_expires_at: new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    justification: params.justification,
  };
  fiscalYears[index] = updated;
  writeDb(fiscalYears);

  return {
    id,
    status: "REOPENED",
    reopened_by,
    reopened_at: updated.reopened_at!,
    reopen_expires_at: updated.reopen_expires_at!,
    justification: params.justification,
  };
}

export async function DeleteFiscalYear({
  id,
  deleted_by,
  params,
}: DeleteFiscalYearParams) {
  await delay(400);
  const fiscalYears = readDb();

  const index = fiscalYears.findIndex(
    (fy) =>
      fy.id === id &&
      fy.tenant_id === params.tenant_id &&
      fy.company_id === params.company_id,
  );

  if (index === -1) {
    return {
      detail: "No fiscal year found for the given id.",
    };
  }

  const remaining = fiscalYears.filter((fy) => fy.id !== id);
  writeDb(remaining);

  return { detail: "Deleted fiscal year." };
}
