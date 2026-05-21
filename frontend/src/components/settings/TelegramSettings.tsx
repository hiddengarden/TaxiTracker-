import { useState } from 'react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '@/stores/settingsStore'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const EVENTS = [
  { id: 'transaction' as const, label: 'New transaction' },
  { id: 'shift' as const, label: 'Shift start / end' },
  { id: 'dailySheet' as const, label: 'Daily sheet generated' },
]

export function TelegramSettings() {
  const { settings, updateSettings } = useSettingsStore()
  const [testing, setTesting] = useState(false)
  const tg = settings.telegram

  const updateTg = (patch: Partial<typeof tg>) =>
    updateSettings({ telegram: { ...tg, ...patch } })

  const toggleEvent = (id: typeof EVENTS[0]['id']) => {
    const events = tg.events.includes(id)
      ? tg.events.filter((e) => e !== id)
      : [...tg.events, id]
    updateTg({ events })
  }

  const handleTest = async () => {
    if (!tg.token || !tg.chatId) { toast.error('Token and Chat ID required'); return }
    setTesting(true)
    try {
      const res = await fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tg.chatId, text: '✅ TaxiTracker connected!' }),
      })
      const data = await res.json()
      if (data.ok) toast.success('Test message sent!')
      else toast.error(`Telegram error: ${data.description}`)
    } catch {
      toast.error('Failed to connect to Telegram')
    }
    setTesting(false)
  }

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-white">Telegram Notifications</h3>

      <Toggle
        checked={tg.enabled}
        onChange={(v) => updateTg({ enabled: v })}
        label="Enable Telegram"
        description="Send notifications to a Telegram bot"
      />

      {tg.enabled && (
        <>
          <Input
            label="Bot Token"
            placeholder="1234567890:ABC…"
            value={tg.token}
            onChange={(e) => updateTg({ token: e.target.value })}
            type="password"
          />
          <Input
            label="Chat ID"
            placeholder="5899420190"
            value={tg.chatId}
            onChange={(e) => updateTg({ chatId: e.target.value })}
          />

          <div className="space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Notify on</div>
            {EVENTS.map(({ id, label }) => (
              <Toggle
                key={id}
                checked={tg.events.includes(id)}
                onChange={() => toggleEvent(id)}
                label={label}
              />
            ))}
          </div>

          <Button variant="secondary" fullWidth onClick={handleTest} loading={testing}>
            Send Test Message
          </Button>
        </>
      )}
    </Card>
  )
}
