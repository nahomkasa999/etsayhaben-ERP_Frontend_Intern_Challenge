import { create } from "zustand";

interface TenantState {
  tenantId: string;
  companyId: string;
  setTenant: (tenantId: string, companyId: string) => void;
}

interface AuthState {
  userId: string;
  userName: string;
  setUser: (userId: string, userName: string) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: "",
  companyId: "",
  setTenant: (tenantId, companyId) => set({ tenantId, companyId }),
}));

export const useFiscalAuthStore = create<AuthState>((set) => ({
  userId: "",
  userName: "",
  setUser: (userId, userName) => set({ userId, userName }),
}));
