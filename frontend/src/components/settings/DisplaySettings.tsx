import { useSettingsStore } from '@/stores/settingsStore'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'

const DATE_FORMATS = [
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (31/12/2026)' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (12/31/2026)' },
  { value: 'yyyy-MM-dd', label: 'ISO (2026-12-31)' },
  { value: 'dd MMM yyyy', label: 'DD Mon YYYY (31 Dec 2026)' },
]

export function DisplaySettings() {
  const { settings, updateSettings } = useSettingsStore()

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-white">Display</h3>
      <Input
        label="Currency Symbol"
        placeholder="£"
        value={settings.currency}
        maxLength={3}
        onChange={(e) => updateSettings({ currency: e.target.value })}
      />
      <Select
        label="Date Format"
        value={settings.dateFormat}
        options={DATE_FORMATS}
        onChange={(e) => updateSettings({ dateFormat: e.target.value })}
      />
    </Card>
  )
}
