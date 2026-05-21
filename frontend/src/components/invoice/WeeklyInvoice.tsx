import { useState } from 'react'
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { calcWeeklySummary } from '@/lib/calculations'
import { currentWeek } from '@/lib/dateUtils'

export function WeeklyInvoice() {
  const { settings } = useSettingsStore()
  const { getDailySheetsForWeek, freezeInvoice } = useInvoiceStore()
  const [{ weekNumber, year }, setWeek] = useState(currentWeek())
  const [loading, setLoading] = useState(false)

  const sheets = getDailySheetsForWeek(weekNumber, year)
  const summary = calcWeeklySummary(sheets)
  const cur = settings.currency

  const handleFreeze = async () => {
    if (sheets.length === 0) { toast.error('No sheets for this week'); return }
    setLoading(true)
    const inv = freezeInvoice(weekNumber, year)
    if (inv) toast.success(`Invoice W${weekNumber}/${year} v${inv.version} frozen`)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week {weekNumber} / {year}</CardTitle>
        <div className="flex items-center gap-1">
          <button onClick={() => setWeek(({ weekNumber: w, year: y }) => ({ weekNumber: w - 1 < 1 ? 52 : w - 1, year: w - 1 < 1 ? y - 1 : y }))} className="p-1 text-gray-400 hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setWeek(({ weekNumber: w, year: y }) => ({ weekNumber: w + 1 > 52 ? 1 : w + 1, year: w + 1 > 52 ? y + 1 : y }))} className="p-1 text-gray-400 hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </CardHeader>

      {sheets.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No daily sheets for this week</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-surface-elevated">
              <div className="text-xs text-gray-400">Days</div>
              <div className="font-mono text-white">{summary.sheetCount}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-surface-elevated">
              <div className="text-xs text-gray-400">Charge</div>
              <div className="font-mono text-white text-sm">{cur}{summary.totalCharge.toFixed(2)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-950/30">
              <div className="text-xs text-green-600">Driver</div>
              <div className="font-mono text-green-400 text-sm">{cur}{summary.totalDriverShare.toFixed(2)}</div>
            </div>
          </div>

          <Button variant="secondary" fullWidth onClick={handleFreeze} loading={loading}>
            <Lock size={14} /> Freeze Invoice
          </Button>
        </>
      )}
    </Card>
  )
}
