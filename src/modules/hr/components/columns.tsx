"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"

import { useSelectionStore } from "../store/selectionStore"
import type { Employee } from "../types"

function SelectionCheckbox({ id }: { id: string }) {
  const selectedIds = useSelectionStore((s) => s.selectedIds)
  const toggleId = useSelectionStore((s) => s.toggleId)
  const isSelected = selectedIds.includes(id)

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => toggleId(id)}
        aria-label="Select row"
      />
    </div>
  )
}

function SelectAllCheckbox({ ids }: { ids: string[] }) {
  const selectedIds = useSelectionStore((s) => s.selectedIds)
  const setSelectedIds = useSelectionStore((s) => s.setSelectedIds)
  const selectedIdSet = new Set(selectedIds)
  const selectedCount = ids.filter((id) => selectedIdSet.has(id)).length
  const allSelected = ids.length > 0 && selectedCount === ids.length
  const someSelected = selectedCount > 0 && !allSelected

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected}
        onCheckedChange={(checked) => {
          if (checked) {
            setSelectedIds([...selectedIds, ...ids])
          } else {
            setSelectedIds(selectedIds.filter((id) => !ids.includes(id)))
          }
        }}
        aria-label={
          allSelected ? "Deselect all employees" : "Select all employees"
        }
      />
    </div>
  )
}

function EmployeeRowActions({ employee }: { employee: Employee }) {
  const router = useRouter()

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${employee.name}`}
        title="Edit employee"
        onClick={() => router.push(`/hr/${employee.id}`)}
      >
        <Pencil />
      </Button>
    </div>
  )
}

export function getEmployeeColumns(employeeIds: string[]): ColumnDef<Employee>[] {
  return [
    {
      id: "select",
      header: () => <SelectAllCheckbox ids={employeeIds} />,
      cell: ({ row }) => <SelectionCheckbox id={row.original.id} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as Employee["status"]
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <EmployeeRowActions employee={row.original} />,
    },
  ]
}
