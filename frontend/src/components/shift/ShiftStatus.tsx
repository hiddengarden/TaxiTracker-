import { Clock, Car, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useShiftStore } from '@/stores/shiftStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { formatDate } from '@/lib/dateUtils'
import { useSettingsStore } from '@/stores/settingsStore'

export function ShiftStatus() {
  const { activeShiftDate, getShift } = useShiftStore()
  const { getShiftTransactions } = useTransactionStore()
  const { settings } = useSettingsStore()

  if (!activeShiftDate) return null

  const startShift = getShift(activeShiftDate, 'start')
  const txns = getShiftTransactions(activeShiftDate)

  return (
    <Card className="mb-4 border-blue-800/50 bg-blue-950/20">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-gray-300">
              <Calendar size={13} className="text-gray-500" />
              {formatDate(activeShiftDate, settings.dateFormat)}
            </span>
            {startShift && (
              <span className="flex items-center gap-1.5 text-sm text-gray-300">
                <Clock size={13} className="text-gray-500" />
                {startShift.time}
              </span>
            )}
            {startShift?.car && (
              <span className="flex items-center gap-1.5 text-sm text-gray-300">
                <Car size={13} className="text-gray-500" />
                {startShift.car}
              </span>
            )}
          </div>
          <div className="text-xs text-blue-400 mt-0.5">{txns.length} transaction{txns.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="flex-shrink-0">
          <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Active</span>
        </div>
      </div>
    </Card>
  )
}
