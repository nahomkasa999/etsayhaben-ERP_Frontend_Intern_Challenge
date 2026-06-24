import  { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchEmployees, deleteEmployee } from '../api/hrApi'
import { useEmployeeFilterStore } from '../stores/employeeFilterStore'
import { useHrStatsStore } from '@/shared/store/hrStatsStore'

export function useEmployees() {
    const queryClient = useQueryClient()

     const [search, setSearch] = useState('')

     const selectedDepartment = useEmployeeFilterStore((s) => s.selectedDepartment)
     const setOnLeaveCount = useHrStatsStore((s) => s.setOnLeaveCount)
    const { data: employees = [], isLoading, isError } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
           const result = await fetchEmployees()
           const onLeaveCount = result.reduce((acc, employee) => acc + (employee.onLeave ? 1 : 0), 0)
           setOnLeaveCount(onLeaveCount)
           return result
        }
    })

    async function removeEmployee(id: string) {
        await deleteEmployee(id)
        queryClient.invalidateQueries({ queryKey: ['employees'] }) // refetch list
    }

      const filtered = employees
    .filter((employee) => employee.name.toLowerCase().includes(search.toLowerCase()))
    .filter((employee) => !selectedDepartment || employee.department === selectedDepartment)



    return { employees: filtered, isLoading, isError, removeEmployee, search, setSearch, selectedDepartment }
}

