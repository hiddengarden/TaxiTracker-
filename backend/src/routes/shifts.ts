import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

function rowToShift(row: Record<string, unknown>) {
  return {
    date: row.date,
    type: row.type,
    time: row.time,
    car: row.car,
    meterReadings: JSON.parse(row.meter_readings as string),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM shifts ORDER BY date DESC, type ASC').all() as Record<string, unknown>[]
  res.json(rows.map(rowToShift))
})

router.post('/', (req: Request, res: Response) => {
  const s = req.body
  if (!s.date || !s.type || !s.time) {
    res.status(400).json({ error: 'date, type, and time are required' })
    return
  }
  if (s.type !== 'start' && s.type !== 'end') {
    res.status(400).json({ error: 'type must be "start" or "end"' })
    return
  }
  db.prepare(`
    INSERT OR REPLACE INTO shifts (date, type, time, car, meter_readings, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(s.date, s.type, s.time, s.car, JSON.stringify(s.meterReadings || []), s.createdAt, s.updatedAt)
  res.status(201).json({ ok: true })
})

router.delete('/:date/:type', (req: Request, res: Response) => {
  db.prepare('DELETE FROM shifts WHERE date = ? AND type = ?').run(req.params.date, req.params.type)
  res.json({ ok: true })
})

export default router
