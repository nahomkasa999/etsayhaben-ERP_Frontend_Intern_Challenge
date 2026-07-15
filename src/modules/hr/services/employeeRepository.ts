import type { Employee as PrismaEmployee } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from "../types";

export class EmployeeRepositoryError extends Error {
  status: number;

  constructor(detail: string, status = 400) {
    super(detail);
    this.name = "EmployeeRepositoryError";
    this.status = status;
  }
}

function toEmployee(record: PrismaEmployee): Employee {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    department: record.department,
    status: record.status,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listEmployees(companyId: string): Promise<Employee[]> {
  const employees = await prisma.employee.findMany({
    where: { companyId },
    orderBy: { updatedAt: "desc" },
  });

  return employees.map(toEmployee);
}

export async function getEmployeeById(
  id: string,
  companyId: string,
): Promise<Employee> {
  const employee = await prisma.employee.findFirst({
    where: { id, companyId },
  });

  if (!employee) {
    throw new EmployeeRepositoryError("Employee not found", 404);
  }

  return toEmployee(employee);
}

export async function createEmployee(
  companyId: string,
  input: CreateEmployeeInput,
): Promise<Employee> {
  const existing = await prisma.employee.findFirst({
    where: { companyId, email: input.email },
  });

  if (existing) {
    throw new EmployeeRepositoryError("Email is already taken", 409);
  }

  const created = await prisma.employee.create({
    data: {
      companyId,
      ...input,
    },
  });

  return toEmployee(created);
}

export async function updateEmployee(
  id: string,
  companyId: string,
  input: UpdateEmployeeInput,
): Promise<Employee> {
  const existing = await prisma.employee.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new EmployeeRepositoryError("Employee not found", 404);
  }

  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.employee.findFirst({
      where: {
        companyId,
        email: input.email,
        NOT: { id },
      },
    });

    if (emailTaken) {
      throw new EmployeeRepositoryError("Email is already taken", 409);
    }
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: input,
  });

  return toEmployee(updated);
}

export async function deleteEmployee(
  id: string,
  companyId: string,
): Promise<void> {
  const existing = await prisma.employee.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new EmployeeRepositoryError("Employee not found", 404);
  }

  await prisma.employee.delete({ where: { id } });
}
