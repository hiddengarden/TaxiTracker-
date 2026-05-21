import React from 'react'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function AppShell({ title, children, action }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-30 bg-surface-card border-b border-surface-border px-4 pt-safe">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
          {action && <div>{action}</div>}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-24 px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  )
}
