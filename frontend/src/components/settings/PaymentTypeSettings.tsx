import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '@/stores/settingsStore'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { PaymentType } from '@/types'

export function PaymentTypeSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const [newLabel, setNewLabel] = useState('')

  const updateType = (id: string, patch: Partial<PaymentType>) => {
    updateSettings({
      paymentTypes: settings.paymentTypes.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })
  }

  const removeType = (id: string) => {
    if (settings.paymentTypes.length <= 1) { toast.error('Need at least one payment type'); return }
    updateSettings({ paymentTypes: settings.paymentTypes.filter((p) => p.id !== id) })
  }

  const addType = () => {
    if (!newLabel.trim()) return
    const id = newLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (settings.paymentTypes.find((p) => p.id === id)) { toast.error('ID already exists'); return }
    updateSettings({
      paymentTypes: [
        ...settings.paymentTypes,
        { id, label: newLabel.trim(), color: '#8b5cf6', bgColor: '#1e1030', enabled: true },
      ],
    })
    setNewLabel('')
    toast.success('Payment type added')
  }

  return (
    <div className="space-y-3">
      {settings.paymentTypes.map((pt) => (
        <Card key={pt.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <GripVertical size={16} className="text-gray-600 flex-shrink-0" />
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 border-2"
              style={{ backgroundColor: pt.bgColor, borderColor: pt.color }}
            />
            <Input
              placeholder="Label"
              value={pt.label}
              onChange={(e) => updateType(pt.id, { label: e.target.value })}
              className="flex-1"
            />
            <button
              onClick={() => removeType(pt.id)}
              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400">Text colour</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={pt.color}
                  onChange={(e) => updateType(pt.id, { color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-surface-border"
                />
                <span className="font-mono text-xs text-gray-400">{pt.color}</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-400">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={pt.bgColor}
                  onChange={(e) => updateType(pt.id, { bgColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-surface-border"
                />
                <span className="font-mono text-xs text-gray-400">{pt.bgColor}</span>
              </div>
            </div>
          </div>

          <Toggle
            checked={pt.enabled}
            onChange={(v) => updateType(pt.id, { enabled: v })}
            label="Enabled"
          />
        </Card>
      ))}

      <Card>
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Add Payment Type</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Label (e.g. Voucher)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addType()}
            className="flex-1"
          />
          <Button onClick={addType} size="sm">
            <Plus size={14} /> Add
          </Button>
        </div>
      </Card>
    </div>
  )
}
