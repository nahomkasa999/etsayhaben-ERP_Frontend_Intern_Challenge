"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FiscalYearTable } from "@/modules/fiscalyear/components/FiscalYearTable";
import { useTenantStore } from "@/modules/fiscalyear/store/FiscalYearStore";

export default function FiscalYearPage() {
  const searchParams = useSearchParams();
  const setTenant = useTenantStore((s) => s.setTenant);

  useEffect(() => {
    const tenantId = searchParams.get("tenant_id");
    const companyId = searchParams.get("company_id");
    if (tenantId && companyId) {
      setTenant(tenantId, companyId);
    }
  }, [searchParams, setTenant]);

  return (
    <div className="p-6">
      <h1 className="text-2xl">Fiscal Year</h1>
      <div>
        <a
          href="/fiscalyear/add"
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          + Add Fiscal Year
        </a>
      </div>
      <FiscalYearTable />
    </div>
  );
}
