// ── GLOBAL STATE (Zustand) ───────────────────────────────────────
// Written by the inventory module, read by the Navbar in the
// root layout — completely different parts of the app.

import { create } from 'zustand'
interface InventoryStatsState {
  lowStockCount: number
  setLowStockCount: (count: number) => void
}

export const useInventoryStatsStore = create<InventoryStatsState>((set) => ({
  lowStockCount: 0,
  setLowStockCount: (count) => set({ lowStockCount: count }),
}))