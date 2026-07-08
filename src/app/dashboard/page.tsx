'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchItems } from '@/modules/inventory/api/inventoryApi'
import { fetchEmployees } from '@/modules/hr/api/hrApi'
import { useInventoryFilterStore } from '@/modules/inventory/store/inventoryFilterStore'
import { useEmployeeFilterStore } from  '@/modules/hr/stores/employeeFilterStore'

import { fetchEmployees } from '@/modules/hr/api/employeeApi'
import { useDepartmentFilterStore } from '@/modules/hr/store/departmentFilterStore'

export default function DashboardPage() {
  // Inventory
  const { data: items = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchItems,
  })

  const selectedCategory =
    useInventoryFilterStore(
      (s) => s.selectedCategory
    )

  const inventoryCount =
    selectedCategory
      ? items.filter(
          (item) =>
            item.category ===
            selectedCategory
        ).length
      : items.length

  // HR
  const { data: employees = [] } =
    useQuery({
      queryKey: ['employees'],
      queryFn: fetchEmployees,
    })

  const selectedDepartment =
    useDepartmentFilterStore(
      (s) => s.selectedDepartment
    )

  const employeeCount =
    selectedDepartment
      ? employees.filter(
          (employee) =>
            employee.department ===
            selectedDepartment
        ).length
      : employees.length

  const onLeaveCount = selectedDepartment
    ? employees.filter((employee) => employee.department === selectedDepartment).length
    : employees.length 

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">
            Inventory Category:
            {' '}
            {selectedCategory ??
              'All categories'}
          </p>

          <p className="text-3xl font-bold">
            {inventoryCount}
          </p>

          <p className="text-sm text-gray-500">
            items
          </p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">
            Department:
            {' '}
            {selectedDepartment ??
              'All departments'}
          </p>

          <p className="text-3xl font-bold">
            {employeeCount}
          </p>

          <p className="text-sm text-gray-500">
            employees
          </p>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="text-xl font-bold">Employees</h2>
        <p className="text-sm text-gray-500">Showing counts for: {selectedDepartment ?? 'All departments'}</p>
        <p className="text-3xl font-bold">{onLeaveCount}</p>
        <p className="text-sm text-gray-500">employees</p>
      </div>
</div>
    </div>
  )
}