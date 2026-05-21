import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction } from '@/types'
import { syncService } from '@/services/syncService'

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (txn: Transaction) => void
  updateTransaction: (id: string, partial: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  getShiftTransactions: (date: string) => Transaction[]
  getWeekTransactions: (weekNumber: number, year: number) => Transaction[]
  importTransactions: (txns: Transaction[]) => void
  clearAll: () => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (txn) => {
        set((state) => ({ transactions: [txn, ...state.transactions] }))
        syncService.push('transaction', txn, 'POST')
      },

      updateTransaction: (id, partial) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t
          ),
        }))
        const updated = get().transactions.find((t) => t.id === id)
        if (updated) syncService.push('transaction', updated, 'PUT', id)
      },

      deleteTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }))
        syncService.push('transaction', null, 'DELETE', id)
      },

      getShiftTransactions: (date) =>
        get().transactions.filter((t) => t.shiftDate === date),

      getWeekTransactions: (weekNumber, year) =>
        get().transactions.filter((t) => t.weekNumber === weekNumber && t.year === year),

      importTransactions: (txns) => set({ transactions: txns }),

      clearAll: () => set({ transactions: [] }),
    }),
    { name: 'taxitracker-transactions' }
  )
)
