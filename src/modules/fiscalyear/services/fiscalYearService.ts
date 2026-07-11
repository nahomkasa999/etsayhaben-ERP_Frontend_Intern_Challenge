import { CreateFiscalYearFormValue } from "../types";

export function validateFiscalYearForm(
  values: CreateFiscalYearFormValue,
): Record<string, string> {
  const error: Record<string, string> = {};
  if (!values.fiscal_year_name.trim())
    error.fiscal_year_name = "Fiscal year is required";
  if (!values.start_date) error.start_date = "Starting Date is required";
  if (!values.end_date) error.end_date = "End Date is required";
  return error;
}
