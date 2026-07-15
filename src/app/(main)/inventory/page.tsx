"use client"

import { useState } from "react"

import { PageHeader } from "@/shared/components/page-header"
import { InventoryTable } from "@/modules/inventory/components/InventoryTable"
import { CreateItemDialog } from "@/modules/inventory/components/CreateItemDialog"

export default function InventoryPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventory"
        actionLabel="+ Add Item"
        onAction={() => setCreateOpen(true)}
      />
      <InventoryTable />
      <CreateItemDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
