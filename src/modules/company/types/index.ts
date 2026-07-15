import { z } from "zod";

export const CompanySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateCompanySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

export const SelectCompanySchema = z.object({
  companyId: z.string().uuid(),
});

export const CompaniesListResponseSchema = z.object({
  companies: z.array(CompanySchema),
  activeCompanyId: z.string().uuid().nullable(),
});

export const SelectCompanyResponseSchema = z.object({
  company: CompanySchema,
  activeCompanyId: z.string().uuid(),
});

export const DeleteCompanyResponseSchema = z.object({
  success: z.literal(true),
});

export type Company = z.infer<typeof CompanySchema>;
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
export type SelectCompanyInput = z.infer<typeof SelectCompanySchema>;
export type CompaniesListResponse = z.infer<typeof CompaniesListResponseSchema>;
export type SelectCompanyResponse = z.infer<typeof SelectCompanyResponseSchema>;

export class CompanyApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CompanyApiError";
    this.status = status;
  }
}
