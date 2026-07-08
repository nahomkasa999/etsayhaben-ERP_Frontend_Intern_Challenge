import { create } from 'zustand'

interface SelectionState {
  selectedIds: string[]
  toggleId: (id: string) => void
  clearSelection: () => void
}

export const useSelectionStore =
  create<SelectionState>((set) => ({
    selectedIds: [],

    toggleId: (id) =>
      set((state) => ({
        selectedIds:
          state.selectedIds.includes(id)
            ? state.selectedIds.filter(
                (existingId) =>
                  existingId !== id
              )
            : [...state.selectedIds, id],
      })),

    clearSelection: () =>
      set({ selectedIds: [] }),
  }))