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
  tenantId: "223e4567-e89b-12d3-a456-426614174000",
  companyId: "223e4567-e89b-12d3-a456-426614174001",
  setTenant: (tenantId, companyId) => set({ tenantId, companyId }),
}));

export const useAuthStore = create<AuthState>((set) => ({
  userId: "223e4567-e89b-12d3-a456-426614174010",
  userName: "Beta User 01",
  setUser: (userId, userName) => set({ userId, userName }),
}));
