// ── PROPS ────────────────────────────────────────────────────────
// Pure presentational component. Everything it needs comes from `employee`.

import { Employee } from '../types'

interface EmployeeDetailPanelProps {
  employee: Employee
}

export function EmployeeDetailPanel({ employee }: EmployeeDetailPanelProps) {
  return (
    <div className="bg-gray-50 p-4 text-sm">
      <p><strong>Email:</strong> {employee.email}</p>
      <p><strong>Role:</strong> {employee.role}</p>
      <p><strong>Joined:</strong> {new Date(employee.joinedAt).toLocaleDateString()}</p>
      <p><strong>Last updated:</strong> {new Date(employee.updatedAt).toLocaleString()}</p>
    </div>
  )
}
