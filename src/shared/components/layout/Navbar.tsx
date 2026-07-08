'use client'

// ── GLOBAL STATE ─────────────────────────────────────────────────
// Reads values written by other modules through Zustand stores.

import Link from 'next/link'

import { useInventoryStatsStore } from '@/shared/store/inventoryStatsStore'
import { useEmployeeStatsStore } from '@/shared/store/employeeStatsStore'

export function Navbar() {
  const lowStockCount =
    useInventoryStatsStore(
      (s) => s.lowStockCount
    )

  const employeesOnLeave =
    useEmployeeStatsStore(
      (s) => s.employeesOnLeave
    )

  return (
    <nav className="flex gap-6 p-4 border-b">
      <Link href="/dashboard">
        Dashboard
      </Link>

      <Link
        href="/inventory"
        className="relative"
      >
        Inventory

        {lowStockCount > 0 && (
          <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
            {lowStockCount}
          </span>
        )}
      </Link>

      <Link
        href="/hr"
        className="relative"
      >
        HR

        {employeesOnLeave > 0 && (
          <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            {employeesOnLeave}
          </span>
        )}
      </Link>
    </nav>
  )
}