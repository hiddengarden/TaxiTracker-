import { useRef, useState } from 'react'
import { Download, Upload, Trash2, FileJson } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useTransactionStore } from '@/stores/transactionStore'
import { useShiftStore } from '@/stores/shiftStore'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { exportJSON, exportTransactionsCSV } from '@/lib/exportUtils'

export function DataSettings() {
  const { transactions, importTransactions, clearAll: clearTxns } = useTransactionStore()
  const { shifts, importShifts, clearAll: clearShifts } = useShiftStore()
  const { dailySheets, frozenInvoices, importData, clearAll: clearInvoices } = useInvoiceStore()
  const { settings } = useSettingsStore()
  const [confirmClear, setConfirmClear] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    exportJSON({ transactions, shifts, dailySheets, frozenInvoices, settings, exportedAt: new Date().toISOString() }, 'taxitracker-backup.json')
    toast.success('Backup exported')
  }

  const handleExportCSV = () => {
    exportTransactionsCSV(transactions)
    toast.success('Transactions CSV exported')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.transactions) importTransactions(data.transactions)
      if (data.shifts) importShifts(data.shifts)
      if (data.dailySheets || data.frozenInvoices) importData(data.dailySheets ?? [], data.frozenInvoices ?? [])
      toast.success('Data imported successfully')
    } catch {
      toast.error('Invalid backup file')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClearAll = () => {
    clearTxns()
    clearShifts()
    clearInvoices()
    setConfirmClear(false)
    toast.success('All data cleared')
  }

  const counts = [
    { label: 'Transactions', count: transactions.length },
    { label: 'Shifts', count: shifts.length },
    { label: 'Daily Sheets', count: dailySheets.length },
    { label: 'Frozen Invoices', count: frozenInvoices.length },
  ]

  return (
    <>
      <div className="space-y-3">
        <Card>
          <h3 className="font-semibold text-white mb-3">Storage</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {counts.map(({ label, count }) => (
              <div key={label} className="bg-surface-elevated rounded-lg p-2.5 text-center">
                <div className="font-mono text-lg text-white">{count}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center">
            Stored in browser localStorage + SQLite backend
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-semibold text-white">Export</h3>
          <Button variant="secondary" fullWidth onClick={handleExportJSON}>
            <FileJson size={14} /> Export Full Backup (JSON)
          </Button>
          <Button variant="secondary" fullWidth onClick={handleExportCSV}>
            <Download size={14} /> Export Transactions (CSV)
          </Button>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-semibold text-white">Import</h3>
          <p className="text-xs text-gray-400">Import a previously exported backup file. Existing data will be merged.</p>
          <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Import Backup (JSON)
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </Card>

        <Card>
          <h3 className="font-semibold text-white mb-2">Danger Zone</h3>
          <p className="text-xs text-gray-400 mb-3">Permanently delete all transactions, shifts, daily sheets, and invoices. Settings are preserved.</p>
          <Button variant="danger" fullWidth onClick={() => setConfirmClear(true)}>
            <Trash2 size={14} /> Clear All Data
          </Button>
        </Card>
      </div>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear All Data?">
        <p className="text-gray-400 text-sm mb-4">
          This will permanently delete all transactions, shifts, daily sheets, and frozen invoices.
          Your settings will be preserved. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleClearAll}>Yes, Clear Everything</Button>
        </div>
      </Modal>
    </>
  )
}
