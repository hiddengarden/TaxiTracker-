import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const row = db.prepare('SELECT data FROM settings WHERE id = 1').get() as { data: string } | undefined
  if (!row) return res.json(null)
  res.json(JSON.parse(row.data))
})

router.put('/', (req: Request, res: Response) => {
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO settings (id, data, updated_at) VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(JSON.stringify(req.body), now)
  res.json({ ok: true })
})

export default router
