// ── GLOBAL STATE (Zustand) ───────────────────────────────────────
// Shared between every row's checkbox and the BulkActionBar.
// Both live inside InventoryTable but are siblings — without this
// store you'd have to "lift state up" and thread it through props.

import { create } from 'zustand'

interface SelectionState {
  selectedIds: string[]
  toggleId: (id: string) => void
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  toggleId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((existingId) => existingId !== id)
        : [...state.selectedIds, id],
    })),
  setSelectedIds: (ids) => set({ selectedIds: [...new Set(ids)] }),
  clearSelection: () => set({ selectedIds: [] }),
}))