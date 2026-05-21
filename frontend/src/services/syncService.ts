type Method = 'POST' | 'PUT' | 'DELETE'
type Entity = 'transaction' | 'shift' | 'dailySheet' | 'invoice'

interface SyncJob {
  entity: Entity
  data: unknown
  method: Method
  id?: string
  retries: number
  createdAt: string
}

const ENDPOINT_MAP: Record<Entity, string> = {
  transaction: '/api/transactions',
  shift: '/api/shifts',
  dailySheet: '/api/daily-sheets',
  invoice: '/api/invoices',
}

const QUEUE_KEY = 'taxitracker-sync-queue'

class SyncService {
  private queue: SyncJob[] = []
  private flushing = false

  constructor() {
    this.loadQueue()
    window.addEventListener('online', () => this.flush())
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(QUEUE_KEY)
      if (saved) this.queue = JSON.parse(saved)
    } catch {
      this.queue = []
    }
  }

  private saveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue))
  }

  push(entity: Entity, data: unknown, method: Method, id?: string) {
    const job: SyncJob = { entity, data, method, id, retries: 0, createdAt: new Date().toISOString() }
    this.queue.push(job)
    this.saveQueue()
    this.flush()
  }

  async flush() {
    if (this.flushing || !navigator.onLine) return
    this.flushing = true

    const pending = [...this.queue]
    const failed: SyncJob[] = []

    for (const job of pending) {
      try {
        await this.execute(job)
      } catch {
        if (job.retries < 5) {
          failed.push({ ...job, retries: job.retries + 1 })
        }
      }
    }

    this.queue = failed
    this.saveQueue()
    this.flushing = false
  }

  private async execute(job: SyncJob): Promise<void> {
    const base = ENDPOINT_MAP[job.entity]
    const url = job.method === 'PUT' || job.method === 'DELETE' ? `${base}/${job.id}` : base

    const res = await fetch(url, {
      method: job.method,
      headers: { 'Content-Type': 'application/json' },
      body: job.method !== 'DELETE' ? JSON.stringify(job.data) : undefined,
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  }

  async pullAll(): Promise<unknown> {
    try {
      const res = await fetch('/api/sync')
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }
}

export const syncService = new SyncService()
