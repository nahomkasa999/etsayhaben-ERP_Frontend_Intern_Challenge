'use client'

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
      <p><strong>Phone:</strong> {employee.phone}</p>
      <p><strong>Status:</strong> {employee.onLeave ? 'On Leave' : 'Active'}</p>
      <p><strong>Last updated:</strong> {new Date(employee.updatedAt).toLocaleString()}</p>
    </div>
  )
}
