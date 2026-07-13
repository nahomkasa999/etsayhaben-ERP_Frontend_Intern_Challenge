"use client";
import { useTenantStore } from "@/modules/fiscalyear/store/FiscalYearStore";
import { useFiscalYear } from "../hooks/useFiscalyear";
import { FiscalYearDetails } from "./FiscalYearDetails";

export function FiscalYearTable() {
  const { tenantId, companyId } = useTenantStore();

  const {
    fiscalYearListsAllResponse,
    fiscalYearListsIsLoading,
    fiscalYearListsIsError,
  } = useFiscalYear(tenantId, companyId);

  if (fiscalYearListsIsLoading) return <p>Loading fiscal years...</p>;
  if (fiscalYearListsIsError)
    return (
      <p>
        Something went wrong loading fiscal years.{" "}
        <button onClick={() => location.reload()}>Retry</button>
      </p>
    );

  return (
    <div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b font-semibold">
            <th className="p-2">Fiscal Year</th>
            <th className="p-2">Status</th>
            <th className="p-2">Start Date</th>
            <th className="p-2">End Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fiscalYearListsAllResponse?.results.map((fiscalYear) => (
            <FiscalYearDetails
              key={fiscalYear.id}
              fiscalYear={fiscalYear}
              tenantId={tenantId}
              companyId={companyId}
            />
          ))}
        </tbody>
      </table>

      {fiscalYearListsAllResponse?.results.length === 0 && (
        <p className="mt-4 text-gray-500">No fiscal years found.</p>
      )}
    </div>
  );
}
