"use client"

import { useMemo } from "react"

import { DataTable } from "@/shared/components/ui/data-table"

import { useEmployees } from "../hooks/useEmployees"
import { getEmployeeColumns } from "./columns"
import { DepartmentFilter } from "./DepartmentFilter"
import { EmployeeBulkActionBar } from "./EmployeeBulkActionBar"
import { EmployeeDetailPanel } from "./EmployeeDetailPanel"
import { SearchBar } from "./SearchBar"
import { Loader2 } from "lucide-react"

export function EmployeeTable() {
  const {
    employees,
    isLoading,
    isError,
    search,
    setSearch,
  } = useEmployees()

  const columns = useMemo(() => getEmployeeColumns(), [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
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
