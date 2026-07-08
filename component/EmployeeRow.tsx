'use client'

// ── LOCAL STATE + PROPS + GLOBAL STATE, all in one component ──────
// - `employee` and `onDelete` come in as PROPS from the parent.
// - `isExpanded` and `confirmOpen` are LOCAL — only this row cares.
// - `selectedIds` comes from GLOBAL state, shared with BulkActionBar.

import { useState } from 'react'
import { Employee } from '../types'
import { useEmployeeSelectionStore } from '../store/employeeSelectionStore'
import { EmployeeDetailPanel } from './EmployeeDetailPanel'

interface EmployeeRowProps {
  employee: Employee
  onDelete: (id: string) => void
}

export function EmployeeRow({ employee, onDelete }: EmployeeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const selectedIds = useEmployeeSelectionStore((s) => s.selectedIds)
  const toggleId = useEmployeeSelectionStore((s) => s.toggleId)
  const isSelected = selectedIds.includes(employee.id)
  const isOnLeave = employee.status === 'on-leave'

  return (
    <>
      <tr
        className={`border-b cursor-pointer ${isOnLeave ? 'bg-amber-50' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="p-2" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isSelected} onChange={() => toggleId(employee.id)} />
        </td>
        <td className="p-2">{employee.name}</td>
        <td className="p-2">{employee.department}</td>
        <td className="p-2">{employee.role}</td>
        <td className="p-2 capitalize">{employee.status.replace('-', ' ')}</td>
        <td className="p-2" onClick={(e) => e.stopPropagation()}>
          {confirmOpen ? (
            <span className="space-x-2">
              <button onClick={() => onDelete(employee.id)} className="text-red-600">Confirm</button>
              <button onClick={() => setConfirmOpen(false)}>Cancel</button>
            </span>
          ) : (
            <button onClick={() => setConfirmOpen(true)} className="text-red-600">Delete</button>
          )}
        </td>
      </tr>

      {/* PROPS: employee is passed down — the child decides how to display it */}
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <EmployeeDetailPanel employee={employee} />
          </td>
        </tr>
      )}
    </>
  )
}
