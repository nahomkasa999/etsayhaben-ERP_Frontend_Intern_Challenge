"use client"

import { useState } from "react"

import { PageHeader } from "@/shared/components/page-header"
import { EmployeeTable } from "@/modules/hr/components/EmployeeTable"
import { CreateEmployeeDialog } from "@/modules/hr/components/CreateEmployeeDialog"

export default function HRPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Employee Directory"
        actionLabel="+ Add Employee"
        onAction={() => setCreateOpen(true)}
      />
      <EmployeeTable />
      <CreateEmployeeDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
