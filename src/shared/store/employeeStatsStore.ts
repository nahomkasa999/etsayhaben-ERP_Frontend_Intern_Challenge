import { create } from 'zustand'

interface EmployeeStatsState {
  employeesOnLeave: number
  setEmployeesOnLeave: (
    count: number
  ) => void
}

export const useEmployeeStatsStore =
  create<EmployeeStatsState>(
    (set) => ({
      employeesOnLeave: 0,

      setEmployeesOnLeave: (
        count
      ) =>
        set({
          employeesOnLeave: count,
        }),
    })
  )