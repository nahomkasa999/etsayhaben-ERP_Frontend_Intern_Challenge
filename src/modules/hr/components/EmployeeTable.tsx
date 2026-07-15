"use client"

import { useMemo } from "react"

import { DataTable } from "@/shared/components/ui/data-table"

import { useEmployees } from "../hooks/useEmployees"
import { getEmployeeColumns } from "./columns"
import { DepartmentFilter } from "./DepartmentFilter"
import { EmployeeBulkActionBar } from "./EmployeeBulkActionBar"
import { EmployeeDetailPanel } from "./EmployeeDetailPanel"
import { SearchBar } from "./SearchBar"

export function EmployeeTable() {
  const {
    employees,
    isLoading,
    isError,
    search,
    setSearch,
    removeEmployee,
  } = useEmployees()

  const columns = useMemo(
    () => getEmployeeColumns((employee) => removeEmployee(employee.id)),
    [removeEmployee]
  )

  if (isLoading) return <p>Loading employees...</p>
  if (isError)
    return (
      <p>
        Something went wrong.{" "}
        <button onClick={() => location.reload()}>Retry</button>
      </p>
    )

  return (
    <div>
      <DataTable
        columns={columns}
        data={employees}
        getRowId={(row) => row.id}
        renderSubComponent={({ row }) => (
          <EmployeeDetailPanel employee={row.original} />
        )}
        subComponentStartColumn={1}
        toolbar={
          <>
            <SearchBar value={search} onChange={setSearch} />
            <DepartmentFilter />
          </>
        }
      />
      <EmployeeBulkActionBar />
    </div>
  )
}
