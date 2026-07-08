'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Employee } from '../types'
import { useSelectionStore } from '../store/selectionStore'
import { EmployeeDetailPanel } from './EmployeeDetailPanel'

interface EmployeeRowProps {
  employee: Employee
  onDelete: (id: string) => void
}

export function EmployeeRow({
  employee,
  onDelete,
}: EmployeeRowProps) {
  const [isExpanded, setIsExpanded] =
    useState(false)

  const [confirmOpen, setConfirmOpen] =
    useState(false)

  const selectedIds =
    useSelectionStore(
      (s) => s.selectedIds
    )

  const toggleId =
    useSelectionStore(
      (s) => s.toggleId
    )

  const isSelected =
    selectedIds.includes(employee.id)

  return (
    <>
      <tr
        className="border-b cursor-pointer"
        onClick={() =>
          setIsExpanded(!isExpanded)
        }
      >
        <td
          className="p-2"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() =>
              toggleId(employee.id)
            }
          />
        </td>

        <td className="p-2">
          {employee.name}
        </td>

        <td className="p-2">
          {employee.email}
        </td>

        <td className="p-2">
          {employee.department}
        </td>

        <td className="p-2">
          {employee.status}
        </td>

        <td
          className="p-2"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {confirmOpen ? (
            <span className="space-x-2">
              <button
                onClick={() =>
                  onDelete(employee.id)
                }
                className="text-red-600"
              >
                Confirm
              </button>

              <button
                onClick={() =>
                  setConfirmOpen(false)
                }
              >
                Cancel
              </button>
            </span>
          ) : (
            <>
              <Link
                href={`/hr/${employee.id}`}
                className="text-blue-400 mr-4"
              >
                Edit
              </Link>

              <button
                onClick={() =>
                  setConfirmOpen(true)
                }
                className="text-red-600"
              >
                Delete
              </button>
            </>
          )}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan={6}
            className="p-0"
          >
            <EmployeeDetailPanel
              employee={employee}
            />
          </td>
        </tr>
      )}
    </>
  )
}