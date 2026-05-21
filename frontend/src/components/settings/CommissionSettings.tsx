import { useSettingsStore } from '@/stores/settingsStore'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Card } from '@/components/ui/Card'

export function CommissionSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const pct = Math.round(settings.commissionRate * 10000) / 100

  return (
    <Card className="space-y-5">
      <h3 className="font-semibold text-white">Commission</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Driver Rate</label>
          <span className="font-mono text-white text-lg font-bold">{pct.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={pct}
          onChange={(e) => updateSettings({ commissionRate: parseFloat(e.target.value) / 100 })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>

      <Input
        label="Exact Rate (%)"
        type="number"
        min="0"
        max="100"
        step="0.1"
        suffix="%"
        value={pct.toFixed(1)}
        onChange={(e) => updateSettings({ commissionRate: parseFloat(e.target.value) / 100 })}
      />

      <div className="pt-2 border-t border-surface-border">
        <Toggle
          checked={settings.cardGratuityInDriverShare}
          onChange={(v) => updateSettings({ cardGratuityInDriverShare: v })}
          label="Include card gratuity in driver share"
          description="When on, card tips are added to the driver's calculated share"
        />
      </div>

      <div className="bg-surface-elevated rounded-lg p-3 text-xs text-gray-400">
        Driver share = Total Charge × {pct.toFixed(1)}%
        {settings.cardGratuityInDriverShare && ' + Card Gratuity'}
      </div>
    </Card>
  )
}
