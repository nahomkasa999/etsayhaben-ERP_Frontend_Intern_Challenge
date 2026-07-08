// ── BUSINESS LOGIC ───────────────────────────────────────────────
// Validation and calculations live here.

import { Employee, EmployeeFormValues } from '../types'

export function validateEmployee(
  values: EmployeeFormValues
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.name.trim())
    errors.name = 'Name is required'

  if (!values.email.trim())
    errors.email = 'Email is required'

  if (!values.email.includes('@'))
    errors.email = 'Invalid email address'

  return errors
}

// Used by the navbar badge
export function countEmployeesOnLeave(
  employees: Employee[]
): number {
  return employees.filter(
    (employee) => employee.status === 'on_leave'
  ).length
}
