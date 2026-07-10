// store/tenantStore.ts
import { create } from "zustand";

interface TenantState {
  tenantId: string;
  companyId: string;
  setTenant: (tenantId: string, companyId: string) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: "123e4567-e89b-12d3-a456-426614174000", // hardcoded for now
  companyId: "123e4567-e89b-12d3-a456-426614174001",
  setTenant: (tenantId, companyId) => set({ tenantId, companyId }),
}));
