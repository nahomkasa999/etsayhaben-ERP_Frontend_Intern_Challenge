'use client'

import { useEmployeeFilterStore } from '../stores/employeeFilterStore'

const Department = ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance']   

export function DepartmentFilter() {
 const selectedDepartment = useEmployeeFilterStore((s) => s.selectedDepartment)
 const setDepartment = useEmployeeFilterStore((s) => s.setDepartment)
  
 return (
    <select
      className="border rounded px-3 py-2"
      value={selectedDepartment ?? ''}
      onChange={(e) => setDepartment(e.target.value || null)}
    >
      <option value="">All departments</option>
      {Department.map((dept) => (
        <option key={dept} value={dept}>{dept}</option>
      ))}
    </select>
  )
}