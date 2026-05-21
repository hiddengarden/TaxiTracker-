import { useState } from 'react'
import { Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatDate } from '@/lib/dateUtils'
import type { FrozenInvoice } from '@/types'

interface Props {
  invoice: FrozenInvoice
}

export function FrozenInvoiceCard({ invoice: inv }: Props) {
  const { settings } = useSettingsStore()
  const [expanded, setExpanded] = useState(false)
  const cur = settings.currency

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white">
              Week {inv.weekNumber} / {inv.year}
              <span className="ml-2 text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">v{inv.version}</span>
            </div>
            <div className="text-xs text-gray-400">Frozen {formatDate(inv.frozenDate, settings.dateFormat)} · {inv.sheets.length} day{inv.sheets.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-sm text-white">{cur}{inv.totalCharge.toFixed(2)}</div>
          <div className="font-mono text-xs text-green-400">{cur}{inv.totalDriverShare.toFixed(2)}</div>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)} className="mt-3 w-full text-gray-400">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide' : 'Show'} breakdown
      </Button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-surface-border">
                <th className="text-left pb-1.5 font-medium">Date</th>
                <th className="text-left pb-1.5 font-medium">Day</th>
                <th className="text-right pb-1.5 font-medium">Charge</th>
                <th className="text-right pb-1.5 font-medium">Driver</th>
              </tr>
            </thead>
            <tbody>
              {inv.sheets.map((s) => (
                <tr key={s.date} className="border-b border-surface-border/50 last:border-0">
                  <td className="py-1.5 font-mono text-gray-300">{formatDate(s.date, 'dd/MM')}</td>
                  <td className="py-1.5 text-gray-400">{s.dayName.slice(0, 3)}</td>
                  <td className="text-right font-mono py-1.5">{cur}{s.chargeTotal.toFixed(2)}</td>
                  <td className="text-right font-mono py-1.5 text-green-400">{cur}{s.driverShare.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan={2} className="pt-2 text-white">TOTAL</td>
                <td className="text-right font-mono pt-2 text-white">{cur}{inv.totalCharge.toFixed(2)}</td>
                <td className="text-right font-mono pt-2 text-green-400">{cur}{inv.totalDriverShare.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
