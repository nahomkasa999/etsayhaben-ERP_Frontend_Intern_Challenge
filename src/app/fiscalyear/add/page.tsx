import { FiscalYearForm } from "@/modules/fiscalyear/components/FiscalYearForm";

export default function AddFiscalYearPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Fiscal Year</h1>
      <FiscalYearForm mode="create" />
    </div>
  );
}
