"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AddFiscalYearPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tenantId = searchParams.get("tenant_id")
    const companyId = searchParams.get("company_id")
    const query =
      tenantId && companyId
        ? `?tenant_id=${tenantId}&company_id=${companyId}`
        : ""
    router.replace(`/fiscalyear${query}`)
  }, [router, searchParams])

  return null
}
