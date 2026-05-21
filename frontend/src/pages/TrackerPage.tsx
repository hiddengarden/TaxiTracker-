import { AppShell } from '@/components/layout/AppShell'
import { ShiftStatus } from '@/components/shift/ShiftStatus'
import { ShiftForm } from '@/components/shift/ShiftForm'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { useShiftStore } from '@/stores/shiftStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function TrackerPage() {
  const { activeShiftDate } = useShiftStore()
  const { settings } = useSettingsStore()

  const title = settings.companyName ? `${settings.companyName}` : 'TaxiTracker'

  return (
    <AppShell title={title}>
      <ShiftStatus />
      {activeShiftDate ? (
        <>
          <TransactionForm />
          <TransactionList />
        </>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          No active shift. Start one below.
        </div>
      )}
      <ShiftForm />
    </AppShell>
  )
}
