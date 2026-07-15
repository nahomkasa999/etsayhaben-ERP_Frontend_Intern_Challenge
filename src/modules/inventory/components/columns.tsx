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
import type { InventoryItem } from "../types"

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
        aria-label={allSelected ? "Deselect all items" : "Select all items"}
      />
    </div>
  )
}

function InventoryRowActions({
  item,
  onDelete,
}: {
  item: InventoryItem
  onDelete: (item: InventoryItem) => void
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
          onClick={() => onDelete(item)}
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
              onClick={() => navigator.clipboard.writeText(item.id)}
            >
              Copy item ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/inventory/${item.id}`)}
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

export function getInventoryColumns(
  onDelete: (item: InventoryItem) => void,
  itemIds: string[]
): ColumnDef<InventoryItem>[] {
  return [
    {
      id: "select",
      header: () => <SelectAllCheckbox ids={itemIds} />,
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
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => {
        const item = row.original
        const isLowStock = item.quantity < item.reorderLevel
        return (
          <span className={isLowStock ? "text-destructive font-medium" : ""}>
            {item.quantity} {item.unit}
          </span>
        )
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("status")}</Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <InventoryRowActions item={row.original} onDelete={onDelete} />
      ),
    },
  ]
}
