"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchFiscalYearById } from "@/modules/fiscalyear/api/fiscalyearApi";
import { FiscalYearForm } from "@/modules/fiscalyear/components/FiscalYearForm";
import { useTenantStore } from "@/modules/fiscalyear/store/FiscalYearStore";
import { useSearchParams } from "next/navigation";
import { FiscalYearActions } from "@/modules/fiscalyear/components/FiscalYearActions";
import type { FiscalYear } from "@/modules/fiscalyear/types";

export default function EditFiscalYearPage() {
  //finding query params
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { tenantId, companyId } = useTenantStore();

  const { data: fiscalYear, isLoading } = useQuery({
    queryKey: ["fiscalYear", id],
    queryFn: () =>
      fetchFiscalYearById(id!, {
        tenant_id: tenantId,
        company_id: companyId,
        date: "",
        calendar_type: "ETHIOPIAN",
      }),
    enabled: !!tenantId && !!companyId,
  });

  if (isLoading) return <p>Loading...</p>;
  if (!fiscalYear || "details" in fiscalYear) return <p>Fiscal year not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Fiscal Year</h1>
      <FiscalYearForm
        mode="edit"
        initialValues={fiscalYear}
      />
      <hr className="my-6" />
      <h2 className="text-lg font-semibold mb-3">Danger Zone</h2>
      <FiscalYearActions fiscalYear={fiscalYear} />
    </div>
  );
}
