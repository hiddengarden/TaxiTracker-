import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Shift } from '@/types'
import { syncService } from '@/services/syncService'

interface ShiftStore {
  shifts: Shift[]
  activeShiftDate: string | null
  saveShift: (shift: Shift) => void
  setActiveShift: (date: string | null) => void
  closeShift: () => void
  getShift: (date: string, type: 'start' | 'end') => Shift | undefined
  importShifts: (shifts: Shift[]) => void
  clearAll: () => void
}

export const useShiftStore = create<ShiftStore>()(
  persist(
    (set, get) => ({
      shifts: [],
      activeShiftDate: null,

      saveShift: (shift) => {
        set((state) => {
          const existing = state.shifts.findIndex(
            (s) => s.date === shift.date && s.type === shift.type
          )
          if (existing >= 0) {
            const updated = [...state.shifts]
            updated[existing] = shift
            return { shifts: updated }
          }
          return { shifts: [...state.shifts, shift] }
        })
        syncService.push('shift', shift, 'POST')
      },

      setActiveShift: (date) => set({ activeShiftDate: date }),

      closeShift: () => set({ activeShiftDate: null }),

      getShift: (date, type) =>
        get().shifts.find((s) => s.date === date && s.type === type),

      importShifts: (shifts) => set({ shifts }),

      clearAll: () => set({ shifts: [], activeShiftDate: null }),
    }),
    { name: 'taxitracker-shifts' }
  )
)
