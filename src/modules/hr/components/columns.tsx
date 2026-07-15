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

export function getEmployeeColumns(): ColumnDef<Employee>[] {
  return [
    {
      id: "select",
      header: () => null,
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
