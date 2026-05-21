import React from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
  suffix?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-gray-400 font-mono select-none">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={cn(
              'w-full rounded-lg bg-surface-elevated border border-surface-border text-white placeholder-gray-600',
              'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              'py-2.5 px-3 text-sm transition-colors',
              prefix && 'pl-8',
              suffix && 'pr-8',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
          {suffix && (
            <span className="absolute right-3 text-gray-400 font-mono select-none">{suffix}</span>
          )}
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
