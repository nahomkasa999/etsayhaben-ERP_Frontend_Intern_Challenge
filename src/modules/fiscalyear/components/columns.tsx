"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { buttonVariants } from "@/shared/components/ui/button"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import { cn } from "@/lib/utils"

import type { FiscalYearList } from "../types"

export type CalendarView = "ETHIOPIAN" | "GREGORIAN"

const STATUS_VARIANT: Record<
  FiscalYearList["status"],
  "default" | "secondary" | "outline"
> = {
  OPEN: "default",
  CLOSED: "secondary",
  REOPENED: "outline",
}

function FiscalYearEditAction({ fiscalYear }: { fiscalYear: FiscalYearList }) {
  const router = useRouter()

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "h-8 w-8"
      )}
      aria-label="Edit fiscal year"
      onClick={(e) => {
        e.stopPropagation()
        router.push(`/fiscalyear/${fiscalYear.id}`)
      }}
    >
      <Pencil className="h-4 w-4" />
    </button>
  )
}

export function getFiscalYearColumns(
  calendarView: CalendarView
): ColumnDef<FiscalYearList>[] {
  const dateSuffix = calendarView === "ETHIOPIAN" ? " (Eth)" : " (Gre)"

  return [
    {
      accessorKey: "fiscal_year_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fiscal Year" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("fiscal_year_name")}</span>
          {row.original.is_active && <Badge variant="outline">Active</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as FiscalYearList["status"]
        return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
      },
    },
    {
      id: "start_date",
      accessorFn: (row) =>
        calendarView === "ETHIOPIAN" ? row.start_date_eth : row.start_date_gre,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={`Start Date${dateSuffix}`}
        />
      ),
    },
    {
      id: "end_date",
      accessorFn: (row) =>
        calendarView === "ETHIOPIAN" ? row.end_date_eth : row.end_date_gre,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={`End Date${dateSuffix}`}
        />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <FiscalYearEditAction fiscalYear={row.original} />,
    },
  ]
}
