import { CreateFiscalYearFormValue } from "../types";

const DDMMYYYY = /^\d{2}-\d{2}-\d{4}$/;

type ParsedDate = { day: number; month: number; year: number };

function parseEthDate(dateStr: string): ParsedDate | null {
  if (!DDMMYYYY.test(dateStr)) return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  if (month < 1 || month > 13) return null;
  if (day < 1) return null;
  if (month <= 12 && day > 30) return null;
  if (month === 13 && day > 6) return null;
  return { day, month, year };
}

function dateToNumber(date: ParsedDate): number {
  return date.year * 10000 + date.month * 100 + date.day;
}

export function validateFiscalYearForm(
  values: CreateFiscalYearFormValue,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.fiscal_year_name.trim()) {
    errors.fiscal_year_name = "Fiscal year name is required";
  }

  if (!values.start_date) {
    errors.start_date = "Start date is required";
  } else if (!parseEthDate(values.start_date)) {
    errors.start_date =
      "Start date must be in DD-MM-YYYY format with a valid date";
  }

  if (!values.end_date) {
    errors.end_date = "End date is required";
  } else if (!parseEthDate(values.end_date)) {
    errors.end_date =
      "End date must be in DD-MM-YYYY format with a valid date";
  }

  if (!errors.start_date && !errors.end_date) {
    const startParsed = parseEthDate(values.start_date);
    const endParsed = parseEthDate(values.end_date);
    if (startParsed && endParsed && dateToNumber(startParsed) >= dateToNumber(endParsed)) {
      errors.end_date = "End date must be after start date";
    }
  }

  return errors;
}
