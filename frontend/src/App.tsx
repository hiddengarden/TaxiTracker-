import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { TrackerPage } from '@/pages/TrackerPage'
import { SheetsPage } from '@/pages/SheetsPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { syncService } from '@/services/syncService'
import { useTransactionStore } from '@/stores/transactionStore'
import { useShiftStore } from '@/stores/shiftStore'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { SyncPayload } from '@/types'

function useSyncOnMount() {
  const { transactions, importTransactions } = useTransactionStore()
  const { shifts, importShifts } = useShiftStore()
  const { dailySheets, frozenInvoices, importData } = useInvoiceStore()
  const { settings, importSettings } = useSettingsStore()

  useEffect(() => {
    syncService.pullAll().then((payload) => {
      if (!payload) return
      const data = payload as SyncPayload

      // Merge: prefer newer updatedAt
      const mergeTxns = mergeByUpdatedAt(transactions, data.transactions ?? [], 'id')
      const mergeShifts = mergeShiftArr(shifts, data.shifts ?? [])
      const mergeSheets = mergeByUpdatedAt(dailySheets, data.dailySheets ?? [], 'date')

      // Frozen invoices: add any from server not locally present
      const localIds = new Set(frozenInvoices.map((i) => i.id))
      const serverOnly = (data.frozenInvoices ?? []).filter((i) => !localIds.has(i.id))
      const mergedInvoices = [...frozenInvoices, ...serverOnly]

      importTransactions(mergeTxns)
      importShifts(mergeShifts)
      importData(mergeSheets, mergedInvoices)

      if (data.settings) {
        importSettings(data.settings)
      } else {
        syncService.push('settings', settings, 'PUT')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function mergeByUpdatedAt<T extends { updatedAt: string }>(
  local: T[],
  remote: T[],
  key: keyof T
): T[] {
  const map = new Map<unknown, T>()
  for (const item of local) map.set(item[key], item)
  for (const item of remote) {
    const existing = map.get(item[key])
    if (!existing || item.updatedAt > existing.updatedAt) map.set(item[key], item)
  }
  return Array.from(map.values())
}

function mergeShiftArr(
  local: import('@/types').Shift[],
  remote: import('@/types').Shift[]
): import('@/types').Shift[] {
  const map = new Map<string, import('@/types').Shift>()
  for (const s of local) map.set(`${s.date}:${s.type}`, s)
  for (const s of remote) {
    const k = `${s.date}:${s.type}`
    const ex = map.get(k)
    if (!ex || s.updatedAt > ex.updatedAt) map.set(k, s)
  }
  return Array.from(map.values())
}

export default function App() {
  useSyncOnMount()

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1c1f2e', color: '#fff', border: '1px solid #2a2d3e' },
          duration: 2500,
        }}
      />
      <Routes>
        <Route path="/" element={<TrackerPage />} />
        <Route path="/sheets" element={<SheetsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
