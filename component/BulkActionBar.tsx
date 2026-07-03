'use client'

// ── GLOBAL STATE ─────────────────────────────────────────────────
// Rendered separately from the table, but reads the SAME store
// as each row's checkbox in EmployeeRow.tsx.

import { useEmployeeSelectionStore } from '../store/employeeSelectionStore'
import { deleteEmployee } from '../api/employeeApi'
import { useQueryClient } from '@tanstack/react-query'

export function BulkActionBar() {
  const selectedIds = useEmployeeSelectionStore((s) => s.selectedIds)
  const clearSelection = useEmployeeSelectionStore((s) => s.clearSelection)
  const queryClient = useQueryClient()

  if (selectedIds.length === 0) return null

  async function handleBulkDelete() {
    await Promise.all(selectedIds.map((id) => deleteEmployee(id)))
    clearSelection()
    queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] })
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-6 py-3 flex items-center gap-4 shadow-lg">
      <span>{selectedIds.length} employee(s) selected</span>
      <button onClick={handleBulkDelete} className="text-red-300 font-bold">Delete selected</button>
      <button onClick={clearSelection}>Cancel</button>
    </div>
  )
}
