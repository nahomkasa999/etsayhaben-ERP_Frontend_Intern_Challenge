'use client'

import { useSelectionStore } from '../store/selectionStore'
import { deleteEmployee } from '../api/employeeApi'
import { useQueryClient } from '@tanstack/react-query'

export function EmployeeBulkActionBar() {
  const selectedIds =
    useSelectionStore((s) => s.selectedIds)

  const clearSelection =
    useSelectionStore((s) => s.clearSelection)

  const queryClient = useQueryClient()

  if (selectedIds.length === 0)
    return null

  async function handleBulkDelete() {
    await Promise.all(
      selectedIds.map((id) =>
        deleteEmployee(id)
      )
    )

    clearSelection()

    queryClient.invalidateQueries({
      queryKey: ['employees'],
    })
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-6 py-3 flex items-center gap-4 shadow-lg">
      <span>
        {selectedIds.length} employee(s)
        selected
      </span>

      <button
        onClick={handleBulkDelete}
        className="text-red-300 font-bold"
      >
        Delete selected
      </button>

      <button onClick={clearSelection}>
        Cancel
      </button>
    </div>
  )
}