import { FiscalYear, FiscalYearRequestForm } from "../types";
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

export async function fetchFiscalYears(): Promise<FiscalYear[]> {
  await delay(400);
  return readDb();
}

export async function fetchFiscalYearById(
  id: string,
): Promise<FiscalYear | undefined> {
  await delay(300);
  return readDb().find((FiscalYear) => FiscalYear.id === id);
}

export async function createFiscalYear(
  payload: FiscalYearRequestForm,
): Promise<FiscalYear> {
  await delay(400);

  const FiscalYears = readDb();

  const newFiscalYear: FiscalYear = {
    ...payload,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };

  writeDb([...FiscalYears, newFiscalYear]);

  return newFiscalYear;
}

export async function updateFiscalYear(
  id: string,
  payload: Partial<FiscalYearRequestForm>,
): Promise<FiscalYear> {
  await delay(400);

  const FiscalYears = readDb();

  const index = FiscalYears.findIndex((FiscalYear) => FiscalYear.id === id);

  if (index === -1) {
    throw new Error("FiscalYear not found.");
  }

  const updatedFiscalYear: FiscalYear = {
    ...FiscalYears[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  FiscalYears[index] = updatedFiscalYear;

  writeDb(FiscalYears);

  return updatedFiscalYear;
}

export async function deleteFiscalYear(id: string): Promise<{ success: true }> {
  await delay(300);

  writeDb(readDb().filter((FiscalYear) => FiscalYear.id !== id));
  return { success: true };
}
