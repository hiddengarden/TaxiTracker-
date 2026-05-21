import { useState } from 'react'
import { PlayCircle, StopCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useShiftStore } from '@/stores/shiftStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { calcShiftSummary } from '@/lib/calculations'
import { nowTime, todayDate, isoWeek, isoWeekYear, dayName } from '@/lib/dateUtils'
import { notifyShift, notifyDailySheet } from '@/services/telegramService'
import type { Shift, DailySheet } from '@/types'

export function ShiftForm() {
  const { settings } = useSettingsStore()
  const { activeShiftDate, saveShift, setActiveShift, closeShift, getShift } = useShiftStore()
  const { getShiftTransactions } = useTransactionStore()
  const { saveDailySheet } = useInvoiceStore()

  const [shiftType, setShiftType] = useState<'start' | 'end'>('start')
  const [time, setTime] = useState(nowTime())
  const [car, setCar] = useState(settings.defaultCar)
  const [readings, setReadings] = useState<string[]>(Array(settings.meterReadingCount).fill(''))
  const [loading, setLoading] = useState(false)
  const [endConfirm, setEndConfirm] = useState(false)

  const handleSave = async () => {
    const today = todayDate()
    setLoading(true)

    const shift: Shift = {
      date: today,
      type: shiftType,
      time,
      car: car.trim(),
      meterReadings: readings.map((r) => parseFloat(r) || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveShift(shift)

    if (shiftType === 'start') {
      setActiveShift(today)
      await notifyShift(settings.telegram, 'start', today, time, car, shift.meterReadings)
      toast.success('Shift started')
    } else {
      toast.success('Shift end recorded — tap End Shift to finalise')
    }
    setLoading(false)
  }

  const handleEndShift = async () => {
    if (!activeShiftDate) return
    setLoading(true)

    const startShift = getShift(activeShiftDate, 'start')
    const endShift = getShift(activeShiftDate, 'end')
    const transactions = getShiftTransactions(activeShiftDate)
    const summary = calcShiftSummary(transactions, settings)

    const sheet: DailySheet = {
      date: activeShiftDate,
      dayName: dayName(activeShiftDate),
      weekNumber: isoWeek(activeShiftDate),
      year: isoWeekYear(activeShiftDate),
      shiftStart: startShift?.time ?? '',
      shiftEnd: endShift?.time ?? time,
      car: startShift?.car ?? car,
      meterReadingsStart: startShift?.meterReadings ?? [],
      meterReadingsEnd: endShift?.meterReadings ?? [],
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveDailySheet(sheet)
    await notifyDailySheet(settings.telegram, sheet, settings.currency)
    await notifyShift(settings.telegram, 'end', activeShiftDate, endShift?.time ?? time, startShift?.car ?? car, endShift?.meterReadings ?? [])
    closeShift()
    setEndConfirm(false)
    toast.success('Shift ended — daily sheet saved')
    setLoading(false)
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Shift</CardTitle>
        </CardHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            {(['start', 'end'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setShiftType(t)}
                className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all capitalize ${
                  shiftType === t
                    ? t === 'start'
                      ? 'text-green-400 bg-green-950/40 border-green-600'
                      : 'text-red-400 bg-red-950/40 border-red-600'
                    : 'text-gray-500 bg-transparent border-surface-border'
                }`}
              >
                {t === 'start' ? <PlayCircle size={14} className="inline mr-1.5" /> : <StopCircle size={14} className="inline mr-1.5" />}
                {t}
              </button>
            ))}
          </div>

          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Input label="Car" placeholder="Registration…" value={car} onChange={(e) => setCar(e.target.value)} />

          {/* Meter readings */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: settings.meterReadingCount }, (_, i) => (
              <Input
                key={i}
                label={`R${i + 1}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="0.0"
                value={readings[i] ?? ''}
                onChange={(e) => setReadings((prev) => { const next = [...prev]; next[i] = e.target.value; return next })}
              />
            ))}
          </div>

          <Button onClick={handleSave} loading={loading} fullWidth>
            {shiftType === 'start' ? 'Start Shift' : 'Record Shift End'}
          </Button>

          {/* End shift / close shift */}
          {activeShiftDate && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => { closeShift(); toast.success('Shift closed') }}>
                <X size={14} /> Close
              </Button>
              <Button variant="danger" size="sm" onClick={() => setEndConfirm(true)}>
                <StopCircle size={14} /> End Shift
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Modal open={endConfirm} onClose={() => setEndConfirm(false)} title="End Shift?">
        <p className="text-gray-400 text-sm mb-4">
          This will generate a Daily Sheet for {activeShiftDate} and clear the active shift.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setEndConfirm(false)}>Cancel</Button>
          <Button variant="danger" fullWidth loading={loading} onClick={handleEndShift}>End Shift</Button>
        </div>
      </Modal>
    </>
  )
}
