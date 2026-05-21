import type { Transaction, DailySheet } from '@/types'

export function exportJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function exportSheetCSV(sheet: DailySheet, currency: string): void {
  const rows = [
    ['Date', 'Time', 'Payment Type', 'Meter', 'Charge', 'Overring', 'Cash In', 'Gratuity', 'Notes'],
    ...sheet.transactions.map((t) => [
      t.shiftDate,
      t.id.split('T')[1]?.slice(0, 8) ?? '',
      t.paymentType,
      t.meter.toFixed(2),
      t.charge.toFixed(2),
      t.overring.toFixed(2),
      t.cashIn.toFixed(2),
      t.gratuity.toFixed(2),
      t.notes,
    ]),
    [],
    ['', '', 'TOTALS', sheet.meterTotal.toFixed(2), sheet.chargeTotal.toFixed(2), sheet.overringTotal.toFixed(2)],
    ['', '', 'Cash', '', sheet.cashTotal.toFixed(2)],
    ['', '', 'Card', '', sheet.cardTotal.toFixed(2)],
    ['', '', 'Account', '', sheet.accountTotal.toFixed(2)],
    ['', '', `Driver Share (${currency})`, '', sheet.driverShare.toFixed(2)],
    ['', '', 'Cash Enclosed', '', sheet.cashEnclosed.toFixed(2)],
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, `daily-sheet-${sheet.date}.csv`)
}

export function exportTransactionsCSV(transactions: Transaction[]): void {
  const rows = [
    ['ID', 'Date', 'Shift Date', 'Week', 'Payment Type', 'Meter', 'Charge', 'Overring', 'Cash In', 'Gratuity', 'Notes'],
    ...transactions.map((t) => [
      t.id,
      t.shiftDate,
      t.shiftDate,
      t.weekNumber,
      t.paymentType,
      t.meter.toFixed(2),
      t.charge.toFixed(2),
      t.overring.toFixed(2),
      t.cashIn.toFixed(2),
      t.gratuity.toFixed(2),
      t.notes,
    ]),
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, `transactions-export.csv`)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
