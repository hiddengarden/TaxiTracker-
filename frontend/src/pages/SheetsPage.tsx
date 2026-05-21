import { AppShell } from '@/components/layout/AppShell'
import { DailySheetCard } from '@/components/dailysheet/DailySheetCard'
import { useInvoiceStore } from '@/stores/invoiceStore'

export function SheetsPage() {
  const { dailySheets } = useInvoiceStore()

  const sorted = [...dailySheets].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <AppShell title="Daily Sheets">
      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No daily sheets yet.</p>
          <p className="text-gray-600 text-xs mt-1">End a shift to generate your first sheet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((sheet) => (
            <DailySheetCard key={sheet.date} sheet={sheet} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
