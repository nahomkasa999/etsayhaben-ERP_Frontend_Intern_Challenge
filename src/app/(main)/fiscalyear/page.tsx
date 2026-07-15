"use client"

import { useState } from "react"

import { PageHeader } from "@/shared/components/page-header"
import { FiscalYearTable } from "@/modules/fiscalyear/components/FiscalYearTable"
import { CreateFiscalYearDialog } from "@/modules/fiscalyear/components/CreateFiscalYearDialog"

export default function FiscalYearPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fiscal Year"
        actionLabel="+ Add Fiscal Year"
        onAction={() => setCreateOpen(true)}
      />
      <FiscalYearTable />
      <CreateFiscalYearDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
