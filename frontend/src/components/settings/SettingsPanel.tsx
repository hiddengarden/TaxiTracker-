import { useState } from 'react'
import { User, Percent, CreditCard, LayoutList, Globe, Bell, Database } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ProfileSettings } from './ProfileSettings'
import { CommissionSettings } from './CommissionSettings'
import { PaymentTypeSettings } from './PaymentTypeSettings'
import { FieldSettings } from './FieldSettings'
import { DisplaySettings } from './DisplaySettings'
import { TelegramSettings } from './TelegramSettings'
import { DataSettings } from './DataSettings'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'commission', label: 'Commission', icon: Percent },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'fields', label: 'Fields', icon: LayoutList },
  { id: 'display', label: 'Display', icon: Globe },
  { id: 'telegram', label: 'Telegram', icon: Bell },
  { id: 'data', label: 'Data', icon: Database },
] as const

type TabId = typeof TABS[number]['id']

export function SettingsPanel() {
  const [active, setActive] = useState<TabId>('profile')

  return (
    <div className="space-y-4">
      {/* Tab scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
              active === id
                ? 'bg-blue-600 text-white'
                : 'bg-surface-elevated text-gray-400 hover:text-white border border-surface-border'
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div>
        {active === 'profile' && <ProfileSettings />}
        {active === 'commission' && <CommissionSettings />}
        {active === 'payments' && <PaymentTypeSettings />}
        {active === 'fields' && <FieldSettings />}
        {active === 'display' && <DisplaySettings />}
        {active === 'telegram' && <TelegramSettings />}
        {active === 'data' && <DataSettings />}
      </div>
    </div>
  )
}
