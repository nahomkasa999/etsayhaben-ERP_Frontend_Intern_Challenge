'use client'

// ── GLOBAL STATE ─────────────────────────────────────────────────
// Reads values WRITTEN by each module's own hook (useInventory, useEmployees).
// The Navbar has no idea HOW these counts were calculated — it just
// displays whatever is currently in each store.

import Link from 'next/link'
import { useInventoryStatsStore } from '@/shared/store/inventoryStatsStore'
import { useHrStatsStore } from '@/shared/store/hrStatsStore'

export function Navbar() {
    const lowStockCount = useInventoryStatsStore((s) => s.lowStockCount)
    const onLeaveCount = useHrStatsStore((s) => s.onLeaveCount)

    return (
        <nav className="flex gap-6 p-4 border-b">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/inventory" className="relative">
                Inventory
                {lowStockCount > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                        {lowStockCount}
                    </span>
                )}
            </Link>
            <Link href="/hr" className="relative">
                Employees
                {onLeaveCount > 0 && (
                    <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                        {onLeaveCount} on leave
                    </span>
                )}
            </Link>
        </nav>
    )
}
