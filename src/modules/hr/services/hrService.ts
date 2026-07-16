import { Employee } from "../types";

export function countEmployeesOnLeave(employees: Employee[]): number {
  return employees.filter((employee) => employee.status === "on_leave").length;
}
