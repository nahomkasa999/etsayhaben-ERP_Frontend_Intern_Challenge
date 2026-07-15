"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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

function EmployeeRowActions({
  employee,
  onDelete,
}: {
  employee: Employee
  onDelete: (employee: Employee) => void
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (confirmOpen) {
    return (
      <span className="space-x-2" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => onDelete(employee)}
        >
          Confirm
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
          Cancel
        </Button>
      </span>
    )
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-8 w-8 p-0"
          )}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(employee.id)}
            >
              Copy employee ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/hr/${employee.id}`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function getEmployeeColumns(
  onDelete: (employee: Employee) => void
): ColumnDef<Employee>[] {
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
      cell: ({ row }) => (
        <EmployeeRowActions employee={row.original} onDelete={onDelete} />
      ),
    },
  ]
}
