'use client'

// This hook is the bridge between UI, API and global state.

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchEmployees,
  deleteEmployee as apiDeleteEmployee,
} from '../api/employeeApi'

import { useDepartmentFilterStore } from '../store/departmentFilterStore'

import { countEmployeesOnLeave } from '../services/hrService'

import { useEmployeeStatsStore } from '@/shared/store/employeeStatsStore'

export function useEmployees() {
  const queryClient = useQueryClient()

  // LOCAL STATE
  const [search, setSearch] = useState('')

  // GLOBAL STATE
  const selectedDepartment =
    useDepartmentFilterStore(
      (s) => s.selectedDepartment
    )

  const setEmployeesOnLeave =
    useEmployeeStatsStore(
      (s) => s.setEmployeesOnLeave
    )

  // SERVER STATE
  const {
    data: employees = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const result = await fetchEmployees()

      setEmployeesOnLeave(
        countEmployeesOnLeave(result)
      )

      return result
    },
  })

  const filtered = employees
    .filter((employee) =>
      employee.name
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(
      (employee) =>
        !selectedDepartment ||
        employee.department === selectedDepartment
    )

  async function removeEmployee(id: string) {
    await apiDeleteEmployee(id)

    queryClient.invalidateQueries({
      queryKey: ['employees'],
    })
  }

  return {
    employees: filtered,
    isLoading,
    isError,
    search,
    setSearch,
    removeEmployee,
  }
}
