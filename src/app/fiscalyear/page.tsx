import { FiscalYearTable } from "@/modules/fiscalyear/components/FiscalYearTable";

export default function FiscalYearPage() {
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
