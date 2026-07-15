import { z } from "zod";

export const CalendarTypeSchema = z.enum(["ETHIOPIAN", "GREGORIAN"]);
export const FiscalYearStatusSchema = z.enum(["OPEN", "CLOSED", "REOPENED"]);

export const FiscalYearSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string(),
  company_id: z.string().uuid(),
  fiscal_year_name: z.string(),
  calendar_type: CalendarTypeSchema,
  start_date_eth: z.string(),
  start_date_gre: z.string(),
  end_date_eth: z.string(),
  end_date_gre: z.string(),
  status: FiscalYearStatusSchema,
  is_active: z.boolean(),
  created_by: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  activated_by: z.string().optional(),
  activated_at: z.string().datetime().optional(),
  updated_by: z.string().optional(),
  closed_by: z.string().optional(),
  closed_at: z.string().datetime().optional(),
  reopened_by: z.string().optional(),
  reopened_at: z.string().datetime().optional(),
  reopen_expires_at: z.string().datetime().optional(),
  justification: z.string().optional(),
});

export const FiscalYearListItemSchema = z.object({
  id: z.string().uuid(),
  fiscal_year_name: z.string(),
  status: FiscalYearStatusSchema,
  start_date_eth: z.string(),
  end_date_eth: z.string(),
  start_date_gre: z.string(),
  end_date_gre: z.string(),
  is_active: z.boolean(),
});

export const FiscalYearListResponseSchema = z.object({
  count: z.number(),
  results: z.array(FiscalYearListItemSchema),
});

export const CreateFiscalYearSchema = z.object({
  fiscal_year_name: z.string().min(1),
  calendar_type: CalendarTypeSchema,
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

export const UpdateFiscalYearSchema = z.object({
  fiscal_year_name: z.string().min(1).optional(),
  start_date: z.string().min(1).optional(),
  end_date: z.string().min(1).optional(),
});

export const CloseFiscalYearSchema = z.object({
  justification: z.string().min(1),
});

export const ReopenFiscalYearSchema = z.object({
  justification: z.string().min(1),
});

export const FiscalYearByDateQuerySchema = z.object({
  date: z.string().min(1),
  calendar_type: CalendarTypeSchema,
});

export const ActivateFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  status: FiscalYearStatusSchema,
  is_active: z.literal(true),
  activated_by: z.string(),
  activated_at: z.string().datetime(),
});

export const CloseFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal("CLOSED"),
  closed_by: z.string(),
  closed_at: z.string().datetime(),
  justification: z.string(),
});

export const ReopenFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal("REOPENED"),
  reopened_by: z.string(),
  reopened_at: z.string().datetime(),
  reopen_expires_at: z.string().datetime(),
  justification: z.string(),
});

export const UpdateFiscalYearResponseSchema = z.object({
  id: z.string().uuid(),
  fiscal_year_name: z.string(),
  start_date_eth: z.string(),
  end_date_eth: z.string(),
  status: FiscalYearStatusSchema,
  updated_by: z.string(),
  updated_at: z.string().datetime(),
});

export const DeleteFiscalYearResponseSchema = z.object({
  detail: z.string(),
});

export type FiscalYear = z.infer<typeof FiscalYearSchema>;
export type FiscalYearList = z.infer<typeof FiscalYearListItemSchema>;
export type FiscalYearListResponse = z.infer<typeof FiscalYearListResponseSchema>;
export type CreateFiscalYearInput = z.infer<typeof CreateFiscalYearSchema>;
export type UpdateFiscalYearInput = z.infer<typeof UpdateFiscalYearSchema>;
export type ActivateFiscalYearResponse = z.infer<
  typeof ActivateFiscalYearResponseSchema
>;
export type CloseFiscalYearResponse = z.infer<typeof CloseFiscalYearResponseSchema>;
export type ReopenFiscalYearResponse = z.infer<typeof ReopenFiscalYearResponseSchema>;
export type UpdateFiscalYearResponse = z.infer<typeof UpdateFiscalYearResponseSchema>;

export interface CreateFiscalYearFormValue {
  fiscal_year_name: string;
  calendar_type: "ETHIOPIAN" | "GREGORIAN";
  start_date: string;
  end_date: string;
}

export class FiscalYearApiError extends Error {
  status: number;
  detail: string;

  constructor(detail: string, status = 400) {
    super(detail);
    this.name = "FiscalYearApiError";
    this.detail = detail;
    this.status = status;
  }
}
