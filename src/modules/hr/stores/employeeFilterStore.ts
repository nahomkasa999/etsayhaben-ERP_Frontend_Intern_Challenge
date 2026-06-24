import { create } from 'zustand'

interface EmployeeFilterState {
    selectedDepartment: string | null,
    setDepartment: (department: string | null) => void
}

export const useEmployeeFilterStore = create<EmployeeFilterState>((set) => {
    return {
        selectedDepartment: null,
        setDepartment: (department) => set({ selectedDepartment: department }),
    }
})