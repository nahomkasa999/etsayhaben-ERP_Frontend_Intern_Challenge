'use client'

// ── COMPONENT COMPOSITION ────────────────────────────────────────
// This is the "page body" for /hr. It calls the useEmployees() hook
// for data, renders search + DepartmentFilter (global) above the
// table, an EmployeeRow per item, and BulkActionBar floating below.
// Pages stay thin — all of this composition lives in components/.

import { useEmployees } from '../hooks/useEmployees'
import { EmployeeRow } from './EmployeeRow'
import { DepartmentFilter } from './DepartmentFilter'
import { BulkActionBar } from './BulkActionBar'

export function EmployeeTable() {
  const { employees, isLoading, isError, search, setSearch, removeEmployee } = useEmployees()

  if (isLoading) return <p>Loading employees...</p>
  if (isError) return <p className="text-red-600">Failed to load employees.</p>

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="border rounded px-3 py-2"
        />
        {/* GLOBAL STATE: same store the Dashboard reads from */}
        <DepartmentFilter />
      </div>

      {employees.length === 0 ? (
        <p className="text-gray-500">No employees found.</p>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2"></th>
              <th className="p-2">Name</th>
              <th className="p-2">Department</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <EmployeeRow key={employee.id} employee={employee} onDelete={removeEmployee} />
            ))}
          </tbody>
        </table>
      )}

      {/* GLOBAL STATE: floats independently, reacts to row checkboxes */}
      <BulkActionBar />
    </div>
  )
}
