import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

function rowToSheet(row: Record<string, unknown>) {
  return {
    date: row.date,
    dayName: row.day_name,
    weekNumber: row.week_number,
    year: row.year,
    shiftStart: row.shift_start,
    shiftEnd: row.shift_end,
    car: row.car,
    meterReadingsStart: JSON.parse(row.meter_readings_start as string),
    meterReadingsEnd: JSON.parse(row.meter_readings_end as string),
    cashTotal: row.cash_total,
    cardTotal: row.card_total,
    accountTotal: row.account_total,
    chargeTotal: row.charge_total,
    meterTotal: row.meter_total,
    overringTotal: row.overring_total,
    cardGratuity: row.card_gratuity,
    cashGratuity: row.cash_gratuity,
    driverShare: row.driver_share,
    cashEnclosed: row.cash_enclosed,
    transactionCount: row.transaction_count,
    transactions: JSON.parse(row.transactions as string),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM daily_sheets ORDER BY date DESC').all() as Record<string, unknown>[]
  res.json(rows.map(rowToSheet))
})

router.post('/', (req: Request, res: Response) => {
  const s = req.body
  if (!s.date || !s.dayName) {
    res.status(400).json({ error: 'date and dayName are required' })
    return
  }
  db.prepare(`
    INSERT OR REPLACE INTO daily_sheets
    (date, day_name, week_number, year, shift_start, shift_end, car,
     meter_readings_start, meter_readings_end,
     cash_total, card_total, account_total, charge_total, meter_total, overring_total,
     card_gratuity, cash_gratuity, driver_share, cash_enclosed, transaction_count,
     transactions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    s.date, s.dayName, s.weekNumber, s.year, s.shiftStart, s.shiftEnd, s.car,
    JSON.stringify(s.meterReadingsStart || []), JSON.stringify(s.meterReadingsEnd || []),
    s.cashTotal, s.cardTotal, s.accountTotal, s.chargeTotal, s.meterTotal, s.overringTotal,
    s.cardGratuity, s.cashGratuity, s.driverShare, s.cashEnclosed, s.transactionCount,
    JSON.stringify(s.transactions || []), s.createdAt, s.updatedAt
  )
  res.status(201).json({ ok: true })
})

export default router
