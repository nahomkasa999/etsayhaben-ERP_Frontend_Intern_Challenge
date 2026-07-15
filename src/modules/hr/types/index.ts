import { z } from "zod";

export const EmployeeDepartmentSchema = z.enum([
  "Store",
  "Engineering",
  "Finance",
  "Marketing",
]);

export const EmployeeStatusSchema = z.enum(["active", "on_leave"]);

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  department: EmployeeDepartmentSchema,
  status: EmployeeStatusSchema,
  updatedAt: z.string().datetime(),
});

export const EmployeeListResponseSchema = z.object({
  employees: z.array(EmployeeSchema),
});

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  department: EmployeeDepartmentSchema,
  status: EmployeeStatusSchema,
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

export const DeleteEmployeeResponseSchema = z.object({
  success: z.literal(true),
});

export type Employee = z.infer<typeof EmployeeSchema>;
export type EmployeeListResponse = z.infer<typeof EmployeeListResponseSchema>;
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
export type EmployeeFormValues = CreateEmployeeInput;

export class EmployeeApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "EmployeeApiError";
    this.status = status;
  }
}
