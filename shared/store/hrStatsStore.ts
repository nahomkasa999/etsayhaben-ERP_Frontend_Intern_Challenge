// ── GLOBAL STATE (Zustand) ───────────────────────────────────────
// Written by the HR module, read by the Navbar in the
// root layout — completely different parts of the app.

import { create } from 'zustand'

interface HrStatsState {
  onLeaveCount: number
  setOnLeaveCount: (count: number) => void
}

export const useHrStatsStore = create<HrStatsState>((set) => ({
  onLeaveCount: 0,
  setOnLeaveCount: (count) => set({ onLeaveCount: count }),
}))
