'use client'

// ── GLOBAL STATE ─────────────────────────────────────────────────
// Reads and writes the Zustand store DIRECTLY. No props needed —
// any component anywhere can use this store the same way.

import { useEmployeeFilterStore } from '../stores/employeeFilterStore'

const DEPARTMENTS = ['Sales', 'Marketing', 'Finance', 'Engineering', 'HR', 'Operations']

export function DepartmentFilter() {
  const filter = useEmployeeFilterStore((s) => s.filter)
  const setFilter = useEmployeeFilterStore((s) => s.setFilter)

  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="border rounded px-3 py-2"
    >
      <option value="">All departments</option>
      {DEPARTMENTS.map((dept) => (
        <option key={dept} value={dept}>{dept}</option>
      ))}
    </select>
  )
}
