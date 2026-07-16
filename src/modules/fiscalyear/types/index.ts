import { z } from "zod";

export const CalendarTypeSchema = z.enum(["ETHIOPIAN", "GREGORIAN"]);
export const FiscalYearStatusSchema = z.enum(["OPEN", "CLOSED", "REOPENED"]);

export const FiscalYearSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  companyId: z.string().uuid(),
  fiscalYearName: z.string(),
  calendarType: CalendarTypeSchema,
  startDateEth: z.string(),
  startDateGre: z.string(),
  endDateEth: z.string(),
  endDateGre: z.string(),
  status: FiscalYearStatusSchema,
  isActive: z.boolean(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activatedBy: z.string().optional(),
  activatedAt: z.string().datetime().optional(),
  updatedBy: z.string().optional(),
  closedBy: z.string().optional(),
  closedAt: z.string().datetime().optional(),
  reopenedBy: z.string().optional(),
  reopenedAt: z.string().datetime().optional(),
  reopenExpiresAt: z.string().datetime().optional(),
  justification: z.string().optional(),
});

export const FiscalYearListItemSchema = z.object({
  id: z.string().uuid(),
  fiscalYearName: z.string(),
  status: FiscalYearStatusSchema,
  startDateEth: z.string(),
  endDateEth: z.string(),
  startDateGre: z.string(),
  endDateGre: z.string(),
  isActive: z.boolean(),
});

export const FiscalYearListResponseSchema = z.object({
  fiscalYears: z.array(FiscalYearListItemSchema),
});

const DDMMYYYY = /^\d{2}-\d{2}-\d{4}$/;

function parseEthDate(dateStr: string) {
  if (!DDMMYYYY.test(dateStr)) return null;
  const [day, month, year] = dateStr.split("-").map(Number);
  if (month < 1 || month > 13) return null;
  if (day < 1) return null;
  if (month <= 12 && day > 30) return null;
  if (month === 13 && day > 6) return null;
  return { day, month, year };
}

function dateToNumber(date: { day: number; month: number; year: number }) {
  return date.year * 10000 + date.month * 100 + date.day;
}

const ethDateString = z
  .string()
  .min(1, "Date is required")
  .refine((value) => parseEthDate(value) !== null, {
    message: "Date must be in DD-MM-YYYY format with a valid date",
  });

const CreateFiscalYearObjectSchema = z.object({
  fiscalYearName: z.string().min(1, "Fiscal year name is required"),
  calendarType: CalendarTypeSchema,
  startDate: ethDateString,
  endDate: ethDateString,
});

export const CreateFiscalYearSchema = CreateFiscalYearObjectSchema.refine(
  (values) => {
    const start = parseEthDate(values.startDate);
    const end = parseEthDate(values.endDate);
    if (!start || !end) return true;
    return dateToNumber(end) > dateToNumber(start);
  },
  { message: "End date must be after start date", path: ["endDate"] },
);

export const UpdateFiscalYearSchema = CreateFiscalYearObjectSchema.partial();

export const CloseFiscalYearSchema = z.object({
  justification: z.string().min(1),
});

export const ReopenFiscalYearSchema = z.object({
  justification: z.string().min(1),
});

export const FiscalYearByDateQuerySchema = z.object({
  date: z.string().min(1),
  calendarType: CalendarTypeSchema,
});

export const ActivateFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  status: FiscalYearStatusSchema,
  isActive: z.literal(true),
  activatedBy: z.string(),
  activatedAt: z.string().datetime(),
});

export const CloseFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal("CLOSED"),
  closedBy: z.string(),
  closedAt: z.string().datetime(),
  justification: z.string(),
});

export const ReopenFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal("REOPENED"),
  reopenedBy: z.string(),
  reopenedAt: z.string().datetime(),
  reopenExpiresAt: z.string().datetime(),
  justification: z.string(),
});

export const UpdateFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  fiscalYearName: z.string(),
  startDateEth: z.string(),
  endDateEth: z.string(),
  status: FiscalYearStatusSchema,
  updatedBy: z.string(),
  updatedAt: z.string().datetime(),
});

export const DeleteFiscalYearResponseSchema = z.object({
  success: z.literal(true),
});

export type FiscalYear = z.infer<typeof FiscalYearSchema>;
export type FiscalYearListItem = z.infer<typeof FiscalYearListItemSchema>;
export type FiscalYearListResponse = z.infer<typeof FiscalYearListResponseSchema>;
export type CreateFiscalYearInput = z.infer<typeof CreateFiscalYearSchema>;
export type UpdateFiscalYearInput = z.infer<typeof UpdateFiscalYearSchema>;
export type ActivateFiscalYearResponse = z.infer<typeof ActivateFiscalYearResponseSchema>;
export type CloseFiscalYearResponse = z.infer<typeof CloseFiscalYearResponseSchema>;
export type ReopenFiscalYearResponse = z.infer<typeof ReopenFiscalYearResponseSchema>;
export type UpdateFiscalYearResponse = z.infer<typeof UpdateFiscalYearResponseSchema>;
export type FiscalYearFormValues = CreateFiscalYearInput;

export class FiscalYearApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "FiscalYearApiError";
    this.status = status;
  }
}
