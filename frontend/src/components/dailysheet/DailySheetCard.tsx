import { useState } from 'react'
import { ChevronDown, ChevronUp, Download, Car, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSettingsStore } from '@/stores/settingsStore'
import { exportSheetCSV } from '@/lib/exportUtils'
import { formatDate } from '@/lib/dateUtils'
import type { DailySheet } from '@/types'

interface Props {
  sheet: DailySheet
  defaultExpanded?: boolean
}

export function DailySheetCard({ sheet, defaultExpanded = false }: Props) {
  const { settings, getPaymentType } = useSettingsStore()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const cur = settings.currency

  const rows = [
    { label: 'Cash', value: sheet.cashTotal, color: '#4caf50' },
    { label: 'Card', value: sheet.cardTotal, color: '#5b9bd5' },
    { label: 'Account', value: sheet.accountTotal, color: '#d55b5b' },
    { label: 'Total Charge', value: sheet.chargeTotal, bold: true },
    { label: 'Meter Total', value: sheet.meterTotal },
    { label: 'Overring', value: sheet.overringTotal },
    { label: 'Card Gratuity', value: sheet.cardGratuity },
    { label: `Driver Share (${Math.round(settings.commissionRate * 100)}%)`, value: sheet.driverShare, bold: true, color: '#4caf50' },
    { label: 'Cash Enclosed', value: sheet.cashEnclosed, bold: true },
  ]

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-white">{sheet.dayName}, {formatDate(sheet.date, settings.dateFormat)}</div>
          <div className="flex items-center gap-3 mt-1">
            {sheet.shiftStart && (
              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{sheet.shiftStart}–{sheet.shiftEnd}</span>
            )}
            {sheet.car && (
              <span className="text-xs text-gray-400 flex items-center gap-1"><Car size={11} />{sheet.car}</span>
            )}
            <span className="text-xs text-gray-400">Week {sheet.weekNumber}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-sm text-white">{cur}{sheet.chargeTotal.toFixed(2)}</div>
          <div className="font-mono text-xs text-green-400">{cur}{sheet.driverShare.toFixed(2)}</div>
          <div className="text-xs text-gray-500">{sheet.transactionCount} txns</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)} className="flex-1 text-gray-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide' : 'Details'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => exportSheetCSV(sheet, cur)}>
          <Download size={14} /> CSV
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Summary table */}
          <div className="space-y-1.5">
            {rows.map((row) => (
              row.value !== 0 && (
                <div key={row.label} className="flex justify-between items-center">
                  <span className={`text-sm ${row.bold ? 'font-semibold text-white' : 'text-gray-400'}`}>{row.label}</span>
                  <span
                    className={`font-mono text-sm ${row.bold ? 'font-semibold' : ''}`}
                    style={row.color ? { color: row.color } : { color: '#fff' }}
                  >
                    {cur}{row.value.toFixed(2)}
                  </span>
                </div>
              )
            ))}
          </div>

          {/* Meter readings */}
          {sheet.meterReadingsStart.length > 0 && (
            <div className="pt-2 border-t border-surface-border">
              <div className="text-xs text-gray-400 mb-2">Meter Readings</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-gray-500 mb-1">Start</div>
                  {sheet.meterReadingsStart.map((r, i) => (
                    <div key={i} className="text-gray-300">R{i + 1}: {r}</div>
                  ))}
                </div>
                <div>
                  <div className="text-gray-500 mb-1">End</div>
                  {sheet.meterReadingsEnd.map((r, i) => (
                    <div key={i} className="text-gray-300">R{i + 1}: {r}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions table */}
          <div className="pt-2 border-t border-surface-border overflow-x-auto">
            <div className="text-xs text-gray-400 mb-2">Transactions</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-surface-border">
                  <th className="text-left pb-1.5 font-medium">Type</th>
                  <th className="text-right pb-1.5 font-medium">Charge</th>
                  <th className="text-right pb-1.5 font-medium">Tip</th>
                  <th className="text-left pb-1.5 font-medium pl-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sheet.transactions.map((txn) => {
                  const pt = getPaymentType(txn.paymentType)
                  return (
                    <tr key={txn.id} className="border-b border-surface-border/50 last:border-0">
                      <td className="py-1.5">
                        <Badge label={pt?.label ?? txn.paymentType} color={pt?.color} bgColor={pt?.bgColor} />
                      </td>
                      <td className="text-right font-mono py-1.5">{cur}{txn.charge.toFixed(2)}</td>
                      <td className="text-right font-mono py-1.5 text-gray-400">
                        {txn.gratuity > 0 ? `${cur}${txn.gratuity.toFixed(2)}` : '—'}
                      </td>
                      <td className="pl-2 py-1.5 text-gray-400 truncate max-w-[100px]">{txn.notes || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  )
}
