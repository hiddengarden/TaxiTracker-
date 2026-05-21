import { AppShell } from '@/components/layout/AppShell'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export function SettingsPage() {
  return (
    <AppShell title="Settings">
      <SettingsPanel />
    </AppShell>
  )
}
