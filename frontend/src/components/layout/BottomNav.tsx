import { NavLink } from 'react-router-dom'
import { Car, FileText, Receipt, Settings } from 'lucide-react'
import { cn } from '@/lib/cn'

const tabs = [
  { to: '/', icon: Car, label: 'Tracker' },
  { to: '/sheets', icon: FileText, label: 'Sheets' },
  { to: '/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card border-t border-surface-border safe-area-pb">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors',
                isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              )
            }
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
