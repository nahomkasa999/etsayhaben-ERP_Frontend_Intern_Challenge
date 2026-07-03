'use client'

// ── GLOBAL STATE ─────────────────────────────────────────────────
// Reads and writes the Zustand store DIRECTLY. No props needed —
// any component anywhere can use this store the same way.

import { useHrFilterStore } from '../store/hrFilterStore'

const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Finance', 'Operations']

export function DepartmentFilter() {
  const selectedDepartment = useHrFilterStore((s) => s.selectedDepartment)
  const setDepartment = useHrFilterStore((s) => s.setDepartment)

  return (
    <select
      value={selectedDepartment ?? ''}
      onChange={(e) => setDepartment(e.target.value || null)}
      className="border rounded px-3 py-2"
    >
      <option value="">All departments</option>
      {DEPARTMENTS.map((department) => (
        <option key={department} value={department}>{department}</option>
      ))}
    </select>
  )
}
