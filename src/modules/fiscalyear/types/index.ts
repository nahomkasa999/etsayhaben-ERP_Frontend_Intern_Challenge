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

export const CreateFiscalYearSchema = z.object({
  fiscalYearName: z.string().min(1),
  calendarType: CalendarTypeSchema,
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export const UpdateFiscalYearSchema = CreateFiscalYearSchema.partial();

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
