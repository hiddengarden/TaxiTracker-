import { useSettingsStore } from '@/stores/settingsStore'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export function ProfileSettings() {
  const { settings, updateSettings } = useSettingsStore()

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-white">Driver & Company</h3>
      <Input
        label="Driver Name"
        placeholder="Full name"
        value={settings.driverName}
        onChange={(e) => updateSettings({ driverName: e.target.value })}
      />
      <Input
        label="License Number"
        placeholder="Licence / badge number"
        value={settings.driverLicense}
        onChange={(e) => updateSettings({ driverLicense: e.target.value })}
      />
      <Input
        label="Company Name"
        placeholder="Fleet or company name"
        value={settings.companyName}
        onChange={(e) => updateSettings({ companyName: e.target.value })}
      />
      <Input
        label="Default Car"
        placeholder="Vehicle registration"
        value={settings.defaultCar}
        onChange={(e) => updateSettings({ defaultCar: e.target.value })}
      />
    </Card>
  )
}
