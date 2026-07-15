"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import { useFiscalYear } from "../hooks/useFiscalyear"
import {
  getFiscalYearColumns,
  type CalendarView,
} from "./columns"

export function FiscalYearTable() {
  const [calendarView, setCalendarView] = useState<CalendarView>("ETHIOPIAN")

  const {
    fiscalYears,
    isLoading,
    isError,
  } = useFiscalYear()

  const columns = useMemo(
    () => getFiscalYearColumns(calendarView),
    [calendarView]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Something went wrong loading fiscal years.
        </p>
        <Button variant="outline" onClick={() => location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={fiscalYears}
      filterColumn="fiscalYearName"
      filterPlaceholder="Filter fiscal years..."
      getRowId={(row) => row.id}
      toolbar={
        <Select
          value={calendarView}
          onValueChange={(value) => {
            if (value) setCalendarView(value as CalendarView)
          }}
          items={[
            { label: "Ethiopian", value: "ETHIOPIAN" },
            { label: "Gregorian", value: "GREGORIAN" },
          ]}
        >
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Calendar" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ETHIOPIAN">Ethiopian</SelectItem>
              <SelectItem value="GREGORIAN">Gregorian</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      }
    />
  )
}
