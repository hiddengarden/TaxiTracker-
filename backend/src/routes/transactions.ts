import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

function rowToTxn(row: Record<string, unknown>) {
  return {
    id: row.id,
    shiftDate: row.shift_date,
    weekNumber: row.week_number,
    year: row.year,
    paymentType: row.payment_type,
    meter: row.meter,
    charge: row.charge,
    overring: row.overring,
    cashIn: row.cash_in,
    gratuity: row.gratuity,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all() as Record<string, unknown>[]
  res.json(rows.map(rowToTxn))
})

router.get('/shift/:date', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM transactions WHERE shift_date = ? ORDER BY created_at ASC').all(req.params.date) as Record<string, unknown>[]
  res.json(rows.map(rowToTxn))
})

router.post('/', (req: Request, res: Response) => {
  const t = req.body
  db.prepare(`
    INSERT OR REPLACE INTO transactions
    (id, shift_date, week_number, year, payment_type, meter, charge, overring, cash_in, gratuity, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(t.id, t.shiftDate, t.weekNumber, t.year, t.paymentType, t.meter, t.charge, t.overring, t.cashIn, t.gratuity, t.notes, t.createdAt, t.updatedAt)
  res.status(201).json({ ok: true })
})

router.put('/:id', (req: Request, res: Response) => {
  const t = req.body
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE transactions SET
      payment_type = ?, meter = ?, charge = ?, overring = ?, cash_in = ?, gratuity = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(t.paymentType, t.meter, t.charge, t.overring, t.cashIn, t.gratuity, t.notes, now, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
