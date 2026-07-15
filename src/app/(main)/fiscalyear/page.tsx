"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { PageHeader } from "@/shared/components/page-header"
import { FiscalYearTable } from "@/modules/fiscalyear/components/FiscalYearTable"
import { CreateFiscalYearDialog } from "@/modules/fiscalyear/components/CreateFiscalYearDialog"
import { useTenantStore } from "@/modules/fiscalyear/store/FiscalYearStore"

export default function FiscalYearPage() {
  const searchParams = useSearchParams()
  const setTenant = useTenantStore((s) => s.setTenant)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const tenantId = searchParams.get("tenant_id")
    const companyId = searchParams.get("company_id")
    if (tenantId && companyId) {
      setTenant(tenantId, companyId)
    }
  }, [searchParams, setTenant])

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
