import { cn } from '@/lib/cn'

interface BadgeProps {
  label: string
  color?: string
  bgColor?: string
  className?: string
}

export function Badge({ label, color, bgColor, className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}
      style={color ? { color, backgroundColor: bgColor ?? color + '22' } : undefined}
    >
      {label}
    </span>
  )
}
