import { z } from "zod";
import { CompanySchema } from "@/modules/company/types";

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const WorkspaceWithCompaniesSchema = WorkspaceSchema.extend({
  companyCount: z.number(),
  companies: z.array(CompanySchema),
});

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  logo: z.string().nullable().optional(),
});

export const SetActiveWorkspaceSchema = z.object({
  organizationId: z.string().min(1),
});

export const OrganizationsListResponseSchema = z.object({
  organizations: z.array(WorkspaceWithCompaniesSchema),
  activeOrganizationId: z.string().nullable(),
});

export const SetActiveWorkspaceResponseSchema = z.object({
  activeOrganizationId: z.string(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceWithCompanies = z.infer<typeof WorkspaceWithCompaniesSchema>;
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type OrganizationsListResponse = z.infer<
  typeof OrganizationsListResponseSchema
>;

export class WorkspaceApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "WorkspaceApiError";
    this.status = status;
  }
}
