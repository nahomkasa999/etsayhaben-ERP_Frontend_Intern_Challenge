"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { fetchFiscalYearById } from "../api/fiscalyearApi"
import { FiscalYearForm } from "../components/FiscalYearForm"
import { FiscalYearActions } from "../components/FiscalYearActions"
import { useTenantStore } from "../store/FiscalYearStore"
import { Badge } from "@/shared/components/ui/badge"

export function FiscalYearEdit() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { tenantId, companyId } = useTenantStore()

  const { data: fiscalYear, isLoading } = useQuery({
    queryKey: ["fiscalYear", id],
    queryFn: () =>
      fetchFiscalYearById(id, {
        tenant_id: tenantId,
        company_id: companyId,
      }),
    enabled: !!id && !!tenantId && !!companyId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!fiscalYear) {
    return (
      <div className="space-y-2 py-12 text-center">
        <h2 className="text-lg font-medium">Fiscal year not found</h2>
        <p className="text-sm text-muted-foreground">
          The fiscal year you are looking for does not exist or was removed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="page-title">{fiscalYear.fiscal_year_name}</h1>
          {fiscalYear.is_active && <Badge variant="outline">Active</Badge>}
          <Badge
            variant={
              fiscalYear.status === "OPEN"
                ? "default"
                : fiscalYear.status === "CLOSED"
                  ? "secondary"
                  : "outline"
            }
          >
            {fiscalYear.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Edit Fiscal Year</p>
      </div>

      <FiscalYearForm mode="edit" initialValues={fiscalYear} />

      <FiscalYearActions fiscalYear={fiscalYear} />
    </div>
  )
}
