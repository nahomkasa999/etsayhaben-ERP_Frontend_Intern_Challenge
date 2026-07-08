// ── GLOBAL STATE (Zustand) ───────────────────────────────────────
// Shared between the HR page (DepartmentFilter) and the
// Dashboard page (DepartmentSummary) — two components with NO
// parent/child relationship. Props can't connect them; a store can.

import { create } from 'zustand'

interface HrFilterState {
  selectedDepartment: string | null
  setDepartment: (department: string | null) => void
}

export const useHrFilterStore = create<HrFilterState>((set) => ({
  selectedDepartment: null,
  setDepartment: (department) => set({ selectedDepartment: department }),
}))
