import { create } from 'zustand'

interface HrStatsState {
    onLeaveCount: number
    setOnLeaveCount: (count: number) => void
}

export const useHrStatsStore = create<HrStatsState>((set) => ({
    onLeaveCount: 0,
    setOnLeaveCount: (count) => set({ onLeaveCount: count }),
}))