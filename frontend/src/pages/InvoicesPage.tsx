import { AppShell } from '@/components/layout/AppShell'
import { WeeklyInvoice } from '@/components/invoice/WeeklyInvoice'
import { FrozenInvoiceCard } from '@/components/invoice/FrozenInvoiceCard'
import { useInvoiceStore } from '@/stores/invoiceStore'

export function InvoicesPage() {
  const { frozenInvoices } = useInvoiceStore()
  const sorted = [...frozenInvoices].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year
    if (b.weekNumber !== a.weekNumber) return b.weekNumber - a.weekNumber
    return b.version - a.version
  })

  return (
    <AppShell title="Invoices">
      <div className="space-y-4">
        <WeeklyInvoice />

        {sorted.length > 0 && (
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Frozen Invoices</h2>
            <div className="space-y-3">
              {sorted.map((inv) => (
                <FrozenInvoiceCard key={inv.id} invoice={inv} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
