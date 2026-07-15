import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  activeCompanyId: string | null;
  setActiveCompanyId: (companyId: string | null) => void;
  clearWorkspaceContext: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      setActiveCompanyId: (companyId) => set({ activeCompanyId: companyId }),
      clearWorkspaceContext: () => set({ activeCompanyId: null }),
    }),
    {
      name: "ethioerp-workspace",
      partialize: (state) => ({ activeCompanyId: state.activeCompanyId }),
    },
  ),
);
