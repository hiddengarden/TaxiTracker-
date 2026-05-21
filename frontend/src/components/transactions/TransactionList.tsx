import { useTransactionStore } from '@/stores/transactionStore'
import { useShiftStore } from '@/stores/shiftStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { TransactionItem } from './TransactionItem'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { calcShiftSummary } from '@/lib/calculations'

export function TransactionList() {
  const { activeShiftDate } = useShiftStore()
  const { getShiftTransactions } = useTransactionStore()
  const { settings } = useSettingsStore()

  if (!activeShiftDate) return null

  const transactions = getShiftTransactions(activeShiftDate)
  if (transactions.length === 0) return null

  const summary = calcShiftSummary(transactions, settings)
  const cur = settings.currency

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>This Shift</CardTitle>
        <span className="text-xs text-gray-400">{transactions.length} transactions</span>
      </CardHeader>

      {/* Mini summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {settings.paymentTypes.filter((p) => p.enabled).map((pt) => {
          const total = summary.byType[pt.id] ?? 0
          if (total === 0) return null
          return (
            <div key={pt.id} className="text-center p-2 rounded-lg" style={{ backgroundColor: pt.bgColor }}>
              <div className="text-xs" style={{ color: pt.color }}>{pt.label}</div>
              <div className="font-mono text-sm text-white">{cur}{total.toFixed(2)}</div>
            </div>
          )
        })}
      </div>

      <div className="font-mono text-right text-sm text-gray-300 mb-3">
        Total: <span className="text-white font-semibold">{cur}{summary.chargeTotal.toFixed(2)}</span>
        {' · '}Driver: <span className="text-green-400 font-semibold">{cur}{summary.driverShare.toFixed(2)}</span>
      </div>

      {/* Transaction rows */}
      <div>
        {transactions.map((txn) => (
          <TransactionItem key={txn.id} txn={txn} />
        ))}
      </div>
    </Card>
  )
}
