import type { FiscalYearFormValues } from "../types";

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
  values: FiscalYearFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.fiscalYearName.trim()) {
    errors.fiscalYearName = "Fiscal year name is required";
  }

  if (!values.startDate) {
    errors.startDate = "Start date is required";
  } else if (!parseEthDate(values.startDate)) {
    errors.startDate =
      "Start date must be in DD-MM-YYYY format with a valid date";
  }

  if (!values.endDate) {
    errors.endDate = "End date is required";
  } else if (!parseEthDate(values.endDate)) {
    errors.endDate =
      "End date must be in DD-MM-YYYY format with a valid date";
  }

  if (!errors.startDate && !errors.endDate) {
    const startParsed = parseEthDate(values.startDate);
    const endParsed = parseEthDate(values.endDate);
    if (startParsed && endParsed && dateToNumber(startParsed) >= dateToNumber(endParsed)) {
      errors.endDate = "End date must be after start date";
    }
  }

  return errors;
}
