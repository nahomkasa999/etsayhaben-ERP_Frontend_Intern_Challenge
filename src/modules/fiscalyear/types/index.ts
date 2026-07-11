export interface FiscalYear {
  id: string;
  tenant_id: string;
  company_id: string;
  fiscal_year_name: string;
  calendar_type: "ETHIOPIAN" | "GREGORIAN";
  start_date_eth: string;
  start_date_gre: string;
  end_date_eth: string;
  end_date_gre: string;
  status: "OPEN" | "CLOSED" | "REOPENED";
  created_by: string;
  created_at: string;
  updated_at: string;
  closed_by?: string | null;
  closed_at?: string | null;
  justification?: string | null;
}

//create fiscal year
export interface CreateFiscalYearRequestBase {
  tenant_id: string;
  company_id: string;
  fiscal_year_name: string;
  calendar_type: "ETHIOPIAN" | "GREGORIAN";
  start_date: string;
  end_date: string;
  created_by: string;
}

export type CreateFiscalYearResponse = Omit<
  FiscalYear,
  "justification" | "closed_at" | "closed_by"
>;

export type CreateFiscalYearFormValue = Omit<
  CreateFiscalYearRequestBase,
  "tenant_id" | "company_id" | "created_by"
>;

//Get Lists
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
// {
//   "id": "85be43fd-dee6-40c3-a622-c4bdeb68473e",
//   "fiscal_year_name": "FY2013",
//   "calendar_type": "ETHIOPIAN",
// EthioHisab — Fiscal Year API
// 2
//   "start_date_eth": "01-11-2012",
//   "start_date_gre": "2020-07-08",
//   "end_date_eth": "30-10-2013",
//   "end_date_gre": "2021-07-07",
//   "status": "OPEN"
// } {
//   "id": "85be43fd-dee6-40c3-a622-c4bdeb68473e",
//   "fiscal_year_name": "FY2013",
//   "calendar_type": "ETHIOPIAN",
// EthioHisab — Fiscal Year API
// 2
//   "start_date_eth": "01-11-2012",
//   "start_date_gre": "2020-07-08",
//   "end_date_eth": "30-10-2013",
//   "end_date_gre": "2021-07-07",
//   "status": "OPEN"
// }
//Get Active List Response,
// export type ActiveFiscalYearResponse = FiscalYear | null;
