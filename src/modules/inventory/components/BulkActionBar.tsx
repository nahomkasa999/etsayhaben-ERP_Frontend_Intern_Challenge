"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

import { deleteItem } from "../hooks/useInventory"
import { useSelectionStore } from "../store/selectionStore"

export function BulkActionBar() {
  const selectedIds = useSelectionStore((s) => s.selectedIds)
  const clearSelection = useSelectionStore((s) => s.clearSelection)
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  if (selectedIds.length === 0) return null

  async function handleBulkDelete() {
    setIsDeleting(true)

    try {
      await Promise.all(selectedIds.map((id) => deleteItem(id)))
      clearSelection()
      await queryClient.invalidateQueries({ queryKey: ["inventory"] })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      role="toolbar"
      aria-label="Bulk inventory actions"
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-background/95 p-2 text-foreground shadow-lg backdrop-blur"
    >
      <span className="px-2 text-sm font-medium whitespace-nowrap">
        {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"} selected
      </span>
      <Button
        variant="destructive"
        onClick={handleBulkDelete}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        {isDeleting ? "Deleting..." : "Delete selected"}
      </Button>
      <Button
        variant="outline"
        onClick={clearSelection}
        disabled={isDeleting}
      >
        Cancel
      </Button>
    </div>
  )
}