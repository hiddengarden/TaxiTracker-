import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const transactions = (db.prepare('SELECT * FROM transactions').all() as Record<string, unknown>[]).map(r => ({
    id: r.id, shiftDate: r.shift_date, weekNumber: r.week_number, year: r.year,
    paymentType: r.payment_type, meter: r.meter, charge: r.charge, overring: r.overring,
    cashIn: r.cash_in, gratuity: r.gratuity, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }))

  const shifts = (db.prepare('SELECT * FROM shifts').all() as Record<string, unknown>[]).map(r => ({
    date: r.date, type: r.type, time: r.time, car: r.car,
    meterReadings: JSON.parse(r.meter_readings as string),
    createdAt: r.created_at, updatedAt: r.updated_at,
  }))

  const dailySheets = (db.prepare('SELECT * FROM daily_sheets').all() as Record<string, unknown>[]).map(r => ({
    date: r.date, dayName: r.day_name, weekNumber: r.week_number, year: r.year,
    shiftStart: r.shift_start, shiftEnd: r.shift_end, car: r.car,
    meterReadingsStart: JSON.parse(r.meter_readings_start as string),
    meterReadingsEnd: JSON.parse(r.meter_readings_end as string),
    cashTotal: r.cash_total, cardTotal: r.card_total, accountTotal: r.account_total,
    chargeTotal: r.charge_total, meterTotal: r.meter_total, overringTotal: r.overring_total,
    cardGratuity: r.card_gratuity, cashGratuity: r.cash_gratuity, driverShare: r.driver_share,
    cashEnclosed: r.cash_enclosed, transactionCount: r.transaction_count,
    transactions: JSON.parse(r.transactions as string),
    createdAt: r.created_at, updatedAt: r.updated_at,
  }))

  const frozenInvoices = (db.prepare('SELECT * FROM frozen_invoices').all() as Record<string, unknown>[]).map(r => ({
    id: r.id, weekNumber: r.week_number, year: r.year, version: r.version,
    frozenDate: r.frozen_date, totalCharge: r.total_charge, totalDriverShare: r.total_driver_share,
    sheets: JSON.parse(r.sheets as string), createdAt: r.created_at,
  }))

  const settingsRow = db.prepare('SELECT data FROM settings WHERE id = 1').get() as { data: string } | undefined
  const settings = settingsRow ? JSON.parse(settingsRow.data) : null

  res.json({ transactions, shifts, dailySheets, frozenInvoices, settings, serverTime: new Date().toISOString() })
})

export default router
