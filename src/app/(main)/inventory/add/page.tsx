// ── ROUTING ──────────────────────────────────────────────────────
// /inventory/add — reuses ItemForm in "create" mode via props.

import { ItemForm } from '@/modules/inventory/components/ItemForm'

export default function AddInventoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Inventory Item</h1>
      <ItemForm mode="create" />
    </div>
  )
}