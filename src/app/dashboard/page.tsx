'use client'

// ── ROUTING + GLOBAL STATE ────────────────────────────────────────
// Completely different page from /inventory, but reads the SAME
// Zustand store (useInventoryFilterStore) that CategoryFilter writes to.

import { useQuery } from '@tanstack/react-query'
import { fetchItems } from '@/modules/inventory/api/inventoryApi'
import { fetchEmployees } from '@/modules/hr/api/hrApi'
import { useInventoryFilterStore } from '@/modules/inventory/store/inventoryFilterStore'
import { useEmployeeFilterStore } from  '@/modules/hr/stores/employeeFilterStore'

export default function DashboardPage() {
  const { data: items = [] } = useQuery({ queryKey: ['inventory'], queryFn: fetchItems })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees })

  const selectedCategory = useInventoryFilterStore((s) => s.selectedCategory)
  const selectedDepartment = useEmployeeFilterStore((s) => s.selectedDepartment)

  const count = selectedCategory
    ? items.filter((item) => item.category === selectedCategory).length
    : items.length

  const onLeaveCount = selectedDepartment
    ? employees.filter((employee) => employee.department === selectedDepartment).length
    : employees.length 

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
      <div className="border rounded p-4">
        <h2 className="text-xl font-bold">Inventory</h2>
        <p className="text-sm text-gray-500">
          Showing counts for: {selectedCategory ?? 'All categories'}
        </p>
        <p className="text-3xl font-bold">{count}</p>
        <p className="text-sm text-gray-500">items</p>
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