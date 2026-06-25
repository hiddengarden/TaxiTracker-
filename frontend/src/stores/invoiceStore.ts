import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DailySheet, FrozenInvoice, Settings, Transaction } from '@/types'
import { syncService } from '@/services/syncService'
import { calcShiftSummary } from '@/lib/calculations'

interface InvoiceStore {
  dailySheets: DailySheet[]
  frozenInvoices: FrozenInvoice[]
  saveDailySheet: (sheet: DailySheet) => void
  getDailySheet: (date: string) => DailySheet | undefined
  getDailySheetsForWeek: (weekNumber: number, year: number) => DailySheet[]
  freezeInvoice: (weekNumber: number, year: number) => FrozenInvoice | null
  recalculateDailySheet: (date: string, transactions: Transaction[], settings: Settings) => void
  deleteDailySheet: (date: string) => void
  importData: (sheets: DailySheet[], invoices: FrozenInvoice[]) => void
  clearAll: () => void
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      dailySheets: [],
      frozenInvoices: [],

      saveDailySheet: (sheet) => {
        set((state) => {
          const existing = state.dailySheets.findIndex((s) => s.date === sheet.date)
          if (existing >= 0) {
            const updated = [...state.dailySheets]
            updated[existing] = sheet
            return { dailySheets: updated }
          }
          return { dailySheets: [sheet, ...state.dailySheets] }
        })
        syncService.push('dailySheet', sheet, 'POST')
      },

      getDailySheet: (date) => get().dailySheets.find((s) => s.date === date),

      getDailySheetsForWeek: (weekNumber, year) =>
        get().dailySheets
          .filter((s) => s.weekNumber === weekNumber && s.year === year)
          .sort((a, b) => a.date.localeCompare(b.date)),

      freezeInvoice: (weekNumber, year) => {
        const sheets = get().getDailySheetsForWeek(weekNumber, year)
        if (sheets.length === 0) return null

        const existingVersions = get().frozenInvoices.filter(
          (inv) => inv.weekNumber === weekNumber && inv.year === year
        )
        const version = existingVersions.length + 1

        const invoice: FrozenInvoice = {
          id: crypto.randomUUID(),
          weekNumber,
          year,
          version,
          frozenDate: new Date().toISOString().split('T')[0],
          totalCharge: sheets.reduce((sum, s) => sum + s.chargeTotal, 0),
          totalDriverShare: sheets.reduce((sum, s) => sum + s.driverShare, 0),
          sheets,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({ frozenInvoices: [invoice, ...state.frozenInvoices] }))
        syncService.push('invoice', invoice, 'POST')
        return invoice
      },

      recalculateDailySheet: (date, transactions, settings) => {
        const existing = get().dailySheets.find((s) => s.date === date)
        if (!existing) return
        const summary = calcShiftSummary(transactions, settings)
        const updated: DailySheet = {
          ...existing,
          cashTotal: summary.cashTotal,
          cardTotal: summary.cardTotal,
          accountTotal: summary.accountTotal,
          chargeTotal: summary.chargeTotal,
          meterTotal: summary.meterTotal,
          overringTotal: summary.overringTotal,
          cardGratuity: summary.cardGratuity,
          cashGratuity: summary.cashGratuity,
          driverShare: summary.driverShare,
          cashEnclosed: summary.cashEnclosed,
          transactionCount: summary.transactionCount,
          transactions,
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          dailySheets: state.dailySheets.map((s) => s.date === date ? updated : s),
        }))
        syncService.push('dailySheet', updated, 'POST')
      },

      deleteDailySheet: (date) =>
        set((state) => ({
          dailySheets: state.dailySheets.filter((s) => s.date !== date),
        })),

      importData: (sheets, invoices) =>
        set({ dailySheets: sheets, frozenInvoices: invoices }),

      clearAll: () => set({ dailySheets: [], frozenInvoices: [] }),
    }),
    { name: 'taxitracker-invoices' }
  )
)
