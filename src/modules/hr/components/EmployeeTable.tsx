'use client'

import { useEmployees } from '../hooks/useEmployees'
import { SearchBar } from './SearchBar'
import { DepartmentFilter } from './DepartmentFilter'
import { EmployeeRow } from './EmployeeRow'
import { EmployeeBulkActionBar } from './EmployeeBulkActionBar'

export function EmployeeTable() {
  const {
    employees,
    isLoading,
    isError,
    search,
    setSearch,
    removeEmployee,
  } = useEmployees()

  if (isLoading)
    return <p>Loading employees...</p>

  if (isError)
    return (
      <p>
        Something went wrong.
        <button
          onClick={() => location.reload()}
        >
          Retry
        </button>
      </p>
    )

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
        />

        <DepartmentFilter />
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b font-semibold">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Department</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              onDelete={removeEmployee}
            />
          ))}
        </tbody>
      </table>

      {employees.length === 0 && (
        <p className="mt-4 text-gray-500">
          No employees found.
        </p>
      )}

      <EmployeeBulkActionBar />
    </div>
  )
}