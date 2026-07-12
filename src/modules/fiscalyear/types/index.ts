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
  activated_by?: string;
  activated_at?: string;
  updated_by?: string;
  closed_by?: string;
  closed_at?: string;
  reopened_by?: string;
  reopened_at?: string;
  reopen_expires_at?: string;
  justification?: string;
}

export interface FiscalYearParams {
  tenant_id: string;
  company_id: string;
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

export interface CreateFiscalYearResponse {
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
}

export interface CreateFiscalYearFormValue {
  fiscal_year_name: string;
  calendar_type: "ETHIOPIAN" | "GREGORIAN";
  start_date: string;
  end_date: string;
}

//Get Lists
export interface FiscalYearList {
  id: string;
  fiscal_year_name: string;
  status: "OPEN" | "CLOSED" | "REOPENED";
  start_date_eth: string;
  end_date_eth: string;
}

export interface FiscalYearListResponse {
  count: number;
  results: FiscalYearList[];
}
//Get Fiscal Year By Date
export interface ListFiscalYearsParams {
  tenant_id: string;
  company_id: string;
}

//Get Fiscal Year By Date
export interface ActiveFiscalYearResponse {
  id: string;
  fiscal_year_name: string;
  calendar_type: "ETHIOPIAN" | "GREGORIAN";
  start_date_eth: string;
  start_date_gre: string;
  end_date_eth: string;
  end_date_gre: string;
  status: "OPEN" | "CLOSED" | "REOPENED";
}

//Get Fiscal Year By Date
export interface FiscalYearByDateParams {
  tenant_id: string;
  company_id: string;
  date: string;
  calendar_type: "ETHIOPIAN" | "GREGORIAN";
}

//Update Fiscal Year
export interface UpdateFiscalYearRequestBase {
  tenant_id: string;
  company_id: string;
  updated_by: string;
  start_date?: string;
  end_date?: string;
  fiscal_year_name?: string;
}

export interface UpdateFiscalYearResponse {
  id: string;
  fiscal_year_name: string;
  start_date_eth: string;
  end_date_eth: string;
  status: "OPEN" | "CLOSED" | "REOPENED";
  updated_by: string;
  updated_at: string;
}

export interface UpdateFiscalYearFormValue {
  start_date?: string;
  end_date?: string;
  fiscal_year_name?: string;
}

export interface UpdateFiscalYearParams {
  id: string;
  updated_by: string;
  params: UpdateFiscalYearRequestBase;
}

//Activate Fiscal Year
export interface ActivateFiscalYearRequestBase {
  tenant_id: string;
  company_id: string;
  activated_by: string;
}

export interface ActivateFiscalYearResponse {
  id: string;
  status: "OPEN" | "CLOSED" | "REOPENED";
  activated_by: string;
  activated_at: string;
}

export interface ActivateFiscalYearFormValue {
  activated_by: string;
}

export interface ActivateFiscalYearParams {
  id: string;
  activated_by: string;
  params: ActivateFiscalYearRequestBase;
}

//Close Fiscal Year
export interface CloseFiscalYearRequestBase {
  tenant_id: string;
  company_id: string;
  closed_by: string;
  justification: string;
}

export interface CloseFiscalYearResponse {
  id: string;
  status: "CLOSED";
  closed_by: string;
  closed_at: string;
  justification: string;
}

export interface CloseFiscalYearFormValue {
  closed_by: string;
  justification: string;
}

export interface CloseFiscalYearParams {
  id: string;
  closed_by: string;
  params: CloseFiscalYearRequestBase;
}

//Reopen Fiscal Year
export interface ReopenFiscalYearRequestBase {
  tenant_id: string;
  company_id: string;
  reopened_by: string;
  justification: string;
}

export interface ReopenFiscalYearResponse {
  id: string;
  status: "REOPENED";
  reopened_by: string;
  reopened_at: string;
  reopen_expires_at: string;
  justification: string;
}

export interface ReopenFiscalYearFormValue {
  reopened_by: string;
  justification: string;
}

export interface ReopenFiscalYearParams {
  id: string;
  reopened_by: string;
  params: ReopenFiscalYearRequestBase;
}

//Delete Fiscal Year
export interface DeleteFiscalYearRequestBase {
  tenant_id: string;
  company_id: string;
  deleted_by: string;
}

export interface DeleteFiscalYearFormValue {
  deleted_by: string;
}

export interface DeleteFiscalYearResponse {
  id: string;
  status: "DELETED";
  deleted_by: string;
  deleted_at: string;
}

export interface DeleteFiscalYearParams {
  id: string;
  deleted_by: string;
  params: DeleteFiscalYearRequestBase;
}
