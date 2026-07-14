"use client";
import { useState } from "react";
import { useFiscalYear } from "../hooks/useFiscalyear";
import { FiscalYearDetails } from "./FiscalYearDetails";

type CalendarView = "ETHIOPIAN" | "GREGORIAN";

export function FiscalYearTable() {
  const [calendarView, setCalendarView] = useState<CalendarView>("ETHIOPIAN");

  const {
    fiscalYearListsAllResponse,
    fiscalYearListsIsLoading,
    fiscalYearListsIsError,
  } = useFiscalYear();

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
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm text-gray-600">Calendar:</label>
        <select
          value={calendarView}
          onChange={(e) => setCalendarView(e.target.value as CalendarView)}
          className="rounded border px-3 py-1 text-sm"
        >
          <option value="ETHIOPIAN">Ethiopian</option>
          <option value="GREGORIAN">Gregorian</option>
        </select>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b font-semibold">
            <th className="p-2">Fiscal Year</th>
            <th className="p-2">Status</th>
            <th className="p-2">Start Date{calendarView === "ETHIOPIAN" ? " (Eth)" : " (Gre)"}</th>
            <th className="p-2">End Date{calendarView === "ETHIOPIAN" ? " (Eth)" : " (Gre)"}</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fiscalYearListsAllResponse?.results.map((fiscalYear) => (
            <FiscalYearDetails
              key={fiscalYear.id}
              fiscalYear={fiscalYear}
              calendarView={calendarView}
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
