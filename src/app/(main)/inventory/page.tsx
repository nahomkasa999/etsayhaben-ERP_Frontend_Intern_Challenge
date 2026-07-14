// ── ROUTING ──────────────────────────────────────────────────────
// This file = the /inventory URL. Thin on purpose — all the logic
// lives in modules/inventory/.

import Link from 'next/link'
import { InventoryTable } from '@/modules/inventory/components/InventoryTable'

export default function InventoryPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <Link href="/inventory/add" className="bg-blue-600 text-white rounded px-4 py-2">
                    + Add Item
                </Link>
            </div>
            <InventoryTable />
        </div>
    )
}