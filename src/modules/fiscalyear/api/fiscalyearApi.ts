import {
  FiscalYear,
  FiscalYearListResponse,
  ListFiscalYearsParams,
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

function writeDb(FiscalYears: FiscalYear[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(FiscalYears));
}

export async function fetchFiscalYearLists(
  params: ListFiscalYearsParams,
): Promise<FiscalYearListResponse> {
  await delay(400);
  const tenant_id = params.tenant_id;
  const company_id = params.company_id;
  const fiscalYears = readDb().filter(
    (fy) => fy.tenant_id === tenant_id && fy.company_id === company_id,
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
