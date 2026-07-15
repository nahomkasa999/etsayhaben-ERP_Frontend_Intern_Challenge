import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../types";
import { CompanyApiError } from "../types";

const API_BASE = "/api/v1/companies";

async function parseError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  throw new CompanyApiError(
    body?.error ?? "Company request failed",
    response.status,
  );
}

export async function fetchCompanies(): Promise<Company[]> {
  const response = await fetch(API_BASE, {
    credentials: "include",
  });

  if (!response.ok) {
    await parseError(response);
  }

  const data = (await response.json()) as { companies: Company[] };
  return data.companies;
}

export async function createCompany(
  input: CreateCompanyInput,
): Promise<Company> {
  const response = await fetch(API_BASE, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<Company>;
}

export async function updateCompany(
  companyId: string,
  input: UpdateCompanyInput,
): Promise<Company> {
  const response = await fetch(`${API_BASE}/${companyId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<Company>;
}

export async function deleteCompany(companyId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${companyId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    await parseError(response);
  }
}
