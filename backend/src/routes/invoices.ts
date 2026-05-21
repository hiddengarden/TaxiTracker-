import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

function rowToInvoice(row: Record<string, unknown>) {
  return {
    id: row.id,
    weekNumber: row.week_number,
    year: row.year,
    version: row.version,
    frozenDate: row.frozen_date,
    totalCharge: row.total_charge,
    totalDriverShare: row.total_driver_share,
    sheets: JSON.parse(row.sheets as string),
    createdAt: row.created_at,
  }
}

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM frozen_invoices ORDER BY year DESC, week_number DESC, version DESC').all() as Record<string, unknown>[]
  res.json(rows.map(rowToInvoice))
})

router.post('/', (req: Request, res: Response) => {
  const inv = req.body
  try {
    db.prepare(`
      INSERT INTO frozen_invoices (id, week_number, year, version, frozen_date, total_charge, total_driver_share, sheets, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(inv.id, inv.weekNumber, inv.year, inv.version, inv.frozenDate, inv.totalCharge, inv.totalDriverShare, JSON.stringify(inv.sheets || []), inv.createdAt)
    res.status(201).json({ ok: true })
  } catch {
    res.status(409).json({ error: 'Invoice already exists' })
  }
})

export default router
