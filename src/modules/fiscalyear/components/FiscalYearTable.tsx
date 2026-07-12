"use client";
import { useTenantStore } from "@/modules/fiscalyear/store/FiscalYearStore";
import { useFiscalYear } from "../hooks/useFiscalyear";
import type { FiscalYearList } from "../types";

const STATUS_COLORS: Record<FiscalYearList["status"], string> = {
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  REOPENED: "bg-yellow-100 text-yellow-800",
};

export function FiscalYearTable() {
  const { tenantId, companyId } = useTenantStore();
  //the activeFiscalYears and related imports and logics should be removed before commit.
  const {
    fiscalYearListsAllResponse,
    fiscalYearListsIsLoading,
    fiscalYearListsIsError,
  } = useFiscalYear(tenantId, companyId);

  if (fiscalYearListsIsLoading) return <p>Loading fiscal years...</p>;
  if (fiscalYearListsIsError)
    return (
      <p>
        Something went loading fiscal years.{" "}
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
          </tr>
        </thead>
        <tbody>
          {fiscalYearListsAllResponse?.results.map((fiscalYear) => (
            <tr
              key={fiscalYear.id}
              className="border-b"
            >
              <td className="p-2">{fiscalYear.fiscal_year_name}</td>
              <td className="p-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[fiscalYear.status]}`}
                >
                  {fiscalYear.status}
                </span>
              </td>
              <td className="p-2">{fiscalYear.start_date_eth}</td>
              <td className="p-2">{fiscalYear.end_date_eth}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {fiscalYearListsAllResponse?.results.length === 0 && (
        <p className="mt-4 text-gray-500">No fiscal years found.</p>
      )}
    </div>
  );
}
