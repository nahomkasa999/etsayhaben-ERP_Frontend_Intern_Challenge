'use client'

import { useDepartmentFilterStore } from '../store/departmentFilterStore'

const DEPARTMENTS = [
  'Store',
  'Engineering',
  'Finance',
  'Marketing',
]

export function DepartmentFilter() {
  const selectedDepartment =
    useDepartmentFilterStore(
      (s) => s.selectedDepartment
    )

  const setDepartment =
    useDepartmentFilterStore(
      (s) => s.setDepartment
    )

  return (
    <select
      value={selectedDepartment ?? ''}
      onChange={(e) =>
        setDepartment(
          e.target.value || null
        )
      }
      className="border rounded px-3 py-2"
    >
      <option value="">
        All Departments
      </option>

      {DEPARTMENTS.map((department) => (
        <option
          key={department}
          value={department}
        >
          {department}
        </option>
      ))}
    </select>
  )
}