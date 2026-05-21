import express from 'express'
import cors from 'cors'
import { initSchema } from './db'
import transactionsRouter from './routes/transactions'
import shiftsRouter from './routes/shifts'
import dailySheetsRouter from './routes/dailySheets'
import invoicesRouter from './routes/invoices'
import settingsRouter from './routes/settings'
import syncRouter from './routes/sync'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json({ limit: '10mb' }))

// Initialize DB schema
initSchema()

app.use('/api/transactions', transactionsRouter)
app.use('/api/shifts', shiftsRouter)
app.use('/api/daily-sheets', dailySheetsRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/sync', syncRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`TaxiTracker API running on http://localhost:${PORT}`)
})
