import { create } from 'zustand'

interface EmployeeFilterStore {
    filter: string
    setFilter: (filter: string) => void
}

export const useEmployeeFilterStore = create<EmployeeFilterStore>((set) => ({
    filter: '',
    setFilter: (filter) => set({ filter }),
}))