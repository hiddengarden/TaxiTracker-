import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useShiftStore } from '@/stores/shiftStore'
import { calcMeterToCharge, calcOverring, calcGratuity } from '@/lib/calculations'
import { nowId, isoWeek, isoWeekYear } from '@/lib/dateUtils'
import { notifyTransaction } from '@/services/telegramService'
import type { Transaction } from '@/types'

interface FormState {
  paymentType: string
  meter: string
  charge: string
  cashIn: string
  notes: string
}

const EMPTY: FormState = { paymentType: '', meter: '', charge: '', cashIn: '', notes: '' }

export function TransactionForm() {
  const { settings } = useSettingsStore()
  const { addTransaction } = useTransactionStore()
  const { activeShiftDate } = useShiftStore()

  const enabledTypes = settings.paymentTypes.filter((p) => p.enabled)
  const [form, setForm] = useState<FormState>({ ...EMPTY, paymentType: enabledTypes[0]?.id ?? 'cash' })
  const [loading, setLoading] = useState(false)

  const cur = settings.currency
  const fieldVisible = (id: string) => settings.fields.find((f) => f.id === id)?.visible ?? true
  const fieldLabel = (id: string) => settings.fields.find((f) => f.id === id)?.label ?? id

  const meterVal = parseFloat(form.meter) || 0
  const chargeVal = parseFloat(form.charge) || 0
  const cashInVal = parseFloat(form.cashIn) || 0
  const overring = calcOverring(meterVal, chargeVal)
  const gratuity = calcGratuity(cashInVal, chargeVal)

  useEffect(() => {
    if (form.meter) {
      const autoCharge = calcMeterToCharge(parseFloat(form.meter) || 0)
      setForm((f) => ({ ...f, charge: autoCharge.toFixed(2) }))
    }
  }, [form.meter])

  const paymentType = settings.paymentTypes.find((p) => p.id === form.paymentType)

  const handleRecord = async () => {
    if (!activeShiftDate) {
      toast.error('No active shift. Start a shift first.')
      return
    }
    if (!chargeVal) {
      toast.error('Charge is required.')
      return
    }

    setLoading(true)
    const id = nowId()
    const now = new Date().toISOString()
    const txn: Transaction = {
      id,
      shiftDate: activeShiftDate,
      weekNumber: isoWeek(activeShiftDate),
      year: isoWeekYear(activeShiftDate),
      paymentType: form.paymentType,
      meter: meterVal,
      charge: chargeVal,
      overring,
      cashIn: cashInVal,
      gratuity,
      notes: form.notes.trim(),
      createdAt: now,
      updatedAt: now,
    }

    addTransaction(txn)
    await notifyTransaction(settings.telegram, txn, cur)

    setForm({ ...EMPTY, paymentType: form.paymentType })
    toast.success(`${cur}${chargeVal.toFixed(2)} recorded`)
    setLoading(false)
  }

  return (
    <Card className="space-y-4">
      {/* Payment type pills */}
      <div className="flex gap-2">
        {enabledTypes.map((pt) => (
          <button
            key={pt.id}
            onClick={() => setForm((f) => ({ ...f, paymentType: pt.id }))}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border-2"
            style={
              form.paymentType === pt.id
                ? { color: pt.color, backgroundColor: pt.bgColor, borderColor: pt.color }
                : { color: '#6b7280', backgroundColor: 'transparent', borderColor: '#2a2d3e' }
            }
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Meter */}
      {fieldVisible('meter') && (
        <Input
          label={fieldLabel('meter')}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          prefix={cur}
          value={form.meter}
          onChange={(e) => setForm((f) => ({ ...f, meter: e.target.value }))}
        />
      )}

      {/* Charge */}
      {fieldVisible('charge') && (
        <Input
          label={fieldLabel('charge')}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          prefix={cur}
          value={form.charge}
          onChange={(e) => setForm((f) => ({ ...f, charge: e.target.value }))}
        />
      )}

      {/* Cash In (only for cash type) */}
      {fieldVisible('cashIn') && form.paymentType === 'cash' && (
        <Input
          label={fieldLabel('cashIn')}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          prefix={cur}
          value={form.cashIn}
          onChange={(e) => setForm((f) => ({ ...f, cashIn: e.target.value }))}
        />
      )}

      {/* Calculated read-only fields */}
      {(fieldVisible('overring') || fieldVisible('gratuity')) && (meterVal > 0 || cashInVal > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {fieldVisible('overring') && meterVal > 0 && (
            <div className="rounded-lg bg-surface-elevated border border-surface-border p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{fieldLabel('overring')}</div>
              <div className="font-mono text-white">{cur}{overring.toFixed(2)}</div>
            </div>
          )}
          {fieldVisible('gratuity') && cashInVal > 0 && (
            <div className="rounded-lg bg-surface-elevated border border-surface-border p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{fieldLabel('gratuity')}</div>
              <div className="font-mono text-white">{cur}{gratuity.toFixed(2)}</div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {fieldVisible('notes') && (
        <Input
          label={fieldLabel('notes')}
          type="text"
          placeholder="Optional notes…"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      )}

      {/* Payment type indicator + Record button */}
      <div className="flex items-center gap-3">
        {paymentType && (
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: paymentType.color }}
          />
        )}
        <Button
          onClick={handleRecord}
          loading={loading}
          fullWidth
          size="lg"
          className="font-bold"
          style={paymentType ? { backgroundColor: paymentType.color + '33', borderColor: paymentType.color, color: paymentType.color } : undefined}
        >
          <PlusCircle size={18} />
          Record {cur}{chargeVal > 0 ? chargeVal.toFixed(2) : '—'}
        </Button>
      </div>
    </Card>
  )
}
