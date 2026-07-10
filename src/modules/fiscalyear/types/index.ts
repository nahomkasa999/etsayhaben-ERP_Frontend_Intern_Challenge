export interface FiscalYear {
  id: string;
  tenant_id: string;
  company_id: string;
  fiscal_year_name: string;
  calendar_type: "ETHIOPIAN" | "GREGORIAN";
  start_date_eth: string;
  start_date_gre?: string;
  end_date_eth: string;
  end_date_gre?: string;
  status: "OPEN" | "CLOSED" | "REOPENED";
  created_by?: string;
  created_at: string;
  updated_at: string;
  closed_by?: string | null;
  closed_at?: string | null;
  justification?: string | null;
}

export type FiscalYearList = Pick<
  FiscalYear,
  "id" | "fiscal_year_name" | "status" | "start_date_eth" | "end_date_eth"
>;

export interface FiscalYearListResponse {
  count: number;
  results: FiscalYearList[];
}

export interface ListFiscalYearsParams {
  tenant_id: string;
  company_id: string;
}
//I have to make this one union,
