"use client";
import { useRouter } from "next/navigation";
import type { FiscalYearList } from "../types";

const STATUS_COLORS: Record<FiscalYearList["status"], string> = {
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  REOPENED: "bg-yellow-100 text-yellow-800",
};

type Props = {
  fiscalYear: FiscalYearList;
  calendarView: "ETHIOPIAN" | "GREGORIAN";
};

export function FiscalYearDetails({ fiscalYear, calendarView }: Props) {
  const router = useRouter();

  const startDate =
    calendarView === "ETHIOPIAN"
      ? fiscalYear.start_date_eth
      : fiscalYear.start_date_gre;
  const endDate =
    calendarView === "ETHIOPIAN"
      ? fiscalYear.end_date_eth
      : fiscalYear.end_date_gre;

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
      <td className="p-2">{startDate}</td>
      <td className="p-2">{endDate}</td>
      <td className="p-2">
        <button
          onClick={() => router.push(`/fiscalyear/edit?id=${fiscalYear.id}`)}
          className="text-blue-600 hover:underline text-sm"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
