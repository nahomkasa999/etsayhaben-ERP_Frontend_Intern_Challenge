// ── GLOBAL STATE (Zustand) ───────────────────────────────────────
// Shared between the Employee page and Dashboard.

import { create } from 'zustand'

interface DepartmentFilterState {
  selectedDepartment: string | null
  setDepartment: (
    department: string | null
  ) => void
}

export const useDepartmentFilterStore =
  create<DepartmentFilterState>((set) => ({
    selectedDepartment: null,

    setDepartment: (department) =>
      set({
        selectedDepartment: department,
      }),
  }))