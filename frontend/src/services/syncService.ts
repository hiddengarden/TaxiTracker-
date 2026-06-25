type Method = 'POST' | 'PUT' | 'DELETE'
type Entity = 'transaction' | 'shift' | 'dailySheet' | 'invoice' | 'settings'

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
  settings: '/api/settings',
}

const QUEUE_KEY = 'taxitracker-sync-queue'
const LAST_SYNC_KEY = 'taxitracker-last-sync'

class ClientError extends Error {}

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
      } catch (err) {
        if (!(err instanceof ClientError) && job.retries < 5) {
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
    // Settings always PUTs to the base URL without an id suffix
    const url = job.entity === 'settings'
      ? base
      : (job.method === 'PUT' || job.method === 'DELETE' ? `${base}/${job.id}` : base)

    const res = await fetch(url, {
      method: job.method,
      headers: { 'Content-Type': 'application/json' },
      body: job.method !== 'DELETE' ? JSON.stringify(job.data) : undefined,
    })

    if (!res.ok) {
      if (res.status >= 400 && res.status < 500) throw new ClientError(`HTTP ${res.status}`)
      throw new Error(`HTTP ${res.status}`)
    }
  }

  async pullAll(): Promise<unknown> {
    try {
      const lastSync = localStorage.getItem(LAST_SYNC_KEY)
      const url = lastSync ? `/api/sync?since=${encodeURIComponent(lastSync)}` : '/api/sync'
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json() as { serverTime?: string }
      if (data.serverTime) localStorage.setItem(LAST_SYNC_KEY, data.serverTime)
      return data
    } catch {
      return null
    }
  }
}

export const syncService = new SyncService()
