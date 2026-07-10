export interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSED" | "LOCKED" | "REOPENED";
  isActive: boolean;
  updatedAt: string;
}

export type FiscalYearRequestForm = Omit<FiscalYear, "id" | "updatedAt">;
