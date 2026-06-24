'use client'

import { Employee } from '../types'
import { useState } from 'react'
import { useSelectionStore } from '../stores/selectionStore'
import Link from 'next/link'
import { EmployeeDetailPanel } from './EmployeeDetailPanel'
interface EmployeeRowProps {
    employee: Employee
    onDelete: (id: string) => void
}
export function EmployeeRow({ employee, onDelete }: EmployeeRowProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const selectedIds = useSelectionStore((s) => s.selectedIds)
    const toggleId = useSelectionStore((s) => s.toggleId)
    const isSelected = selectedIds.includes(employee.id)

    return (
        <>
        <tr className="border-b" onClick={() => setIsExpanded(!isExpanded)}>
            <td className="p-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={isSelected} onChange={() => toggleId(employee.id)} /></td>
            <td className="p-2">{employee.name}</td>
            <td className="p-2">{employee.department}</td>
            <td className="p-2">{employee.email}</td>
            <td className="p-2">{employee.phone}</td>
            <td className="p-2">{employee.onLeave ? 'Yes' : 'No'}</td>
            <td className="p-2" onClick={(e) => e.stopPropagation()}>
          {confirmOpen ? (
            <span className="space-x-2">
              <button onClick={() => onDelete(employee.id)} className="text-red-600">Confirm</button>
              <button onClick={() => setConfirmOpen(false)}>Cancel</button>
            </span>
          ) : (
            <>
            <Link href={`/hr/${employee.id}`} className="text-blue-600 px-4">
              Edit
            </Link>
            <button onClick={() => setConfirmOpen(true)} className="text-red-600">Delete</button>
            
            </>
          )}
          
        </td>
        </tr>
         {isExpanded && (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmployeeDetailPanel employee={employee} />
                  </td>
                </tr>
              )}
        </>

    )
}