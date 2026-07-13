"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/fiscalyear/store/FiscalYearStore";
import { DeleteFiscalYear } from "../api/fiscalyearApi";
import type { FiscalYearList } from "../types";

const STATUS_COLORS: Record<FiscalYearList["status"], string> = {
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  REOPENED: "bg-yellow-100 text-yellow-800",
};

type Props = {
  fiscalYear: FiscalYearList;
  tenantId: string;
  companyId: string;
};

export function FiscalYearDetails({ fiscalYear, tenantId, companyId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this fiscal year?")) return;
    setDeleting(true);
    try {
      await DeleteFiscalYear({
        id: fiscalYear.id,
        deleted_by: userId,
        params: { tenant_id: tenantId, company_id: companyId, deleted_by: userId },
      });
      queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
    } catch {
      alert("Failed to delete fiscal year.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr className="border-b">
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
      <td className="p-2 space-x-2">
        <button
          onClick={() => router.push(`/fiscalyear/edit?id=${fiscalYear.id}`)}
          className="text-blue-600 hover:underline text-sm"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:underline text-sm disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}
