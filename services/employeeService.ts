// ── BUSINESS LOGIC ───────────────────────────────────────────────
// Sits between components and api/. Validation and calculations live
// here so they're reusable and testable without React.

import { Employee } from '../type'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmployee(values: Employee): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!values.name.trim()) errors.name = 'Name is required'
  if (!values.department.trim()) errors.department = 'Department is required'
  if (!values.position.trim()) errors.position = 'Position is required'
  if (values.salary <= 0) errors.salary = 'Salary must be greater than 0'
  if (!values.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!values.role?.trim()) errors.role = 'Role is required'
  return errors
}

// Used by the navbar badge — counts employees currently on leave
export function countOnLeave(employees: Employee[]): number {
  return employees.filter((employee) => employee.status === 'leave').length
}
