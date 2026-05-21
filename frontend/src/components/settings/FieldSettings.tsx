import { useSettingsStore } from '@/stores/settingsStore'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Card } from '@/components/ui/Card'
import type { FieldConfig } from '@/types'

export function FieldSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const updateField = (id: string, patch: Partial<FieldConfig>) => {
    updateSettings({
      fields: settings.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    })
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-4">
        <h3 className="font-semibold text-white">Transaction Fields</h3>
        <p className="text-xs text-gray-400">Rename or hide fields that appear on the transaction form.</p>
        {settings.fields.map((field) => (
          <div key={field.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
            <div className="flex-1">
              <Input
                placeholder={field.id}
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
              />
            </div>
            <Toggle
              checked={field.visible}
              onChange={(v) => updateField(field.id, { visible: v })}
            />
          </div>
        ))}
      </Card>

      <Card>
        <h3 className="font-semibold text-white mb-3">Meter Readings</h3>
        <p className="text-xs text-gray-400 mb-3">How many meter reading inputs to show on the shift form (R1–R4).</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => updateSettings({ meterReadingCount: n })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                settings.meterReadingCount === n
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                  : 'border-surface-border bg-transparent text-gray-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
