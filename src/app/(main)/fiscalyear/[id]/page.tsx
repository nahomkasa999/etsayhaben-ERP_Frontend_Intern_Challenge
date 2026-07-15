"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { fetchFiscalYearById } from "@/modules/fiscalyear/api/fiscalyearApi"
import { FiscalYearForm } from "@/modules/fiscalyear/components/FiscalYearForm"
import { FiscalYearActions } from "@/modules/fiscalyear/components/FiscalYearActions"
import { useTenantStore } from "@/modules/fiscalyear/store/FiscalYearStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"

export default function EditFiscalYearPage() {
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
          <h1 className="page-title">Edit Fiscal Year</h1>
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
        <p className="text-sm text-muted-foreground">
          {fiscalYear.fiscal_year_name}
        </p>
      </div>

      <FiscalYearForm mode="edit" initialValues={fiscalYear} />

      <Separator />

      <Card className="max-w-xl border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Closing, reopening, or deleting a fiscal year can affect dependent
            records. Proceed with care.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FiscalYearActions fiscalYear={fiscalYear} />
        </CardContent>
      </Card>
    </div>
  )
}
