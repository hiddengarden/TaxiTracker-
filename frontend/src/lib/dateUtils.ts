import { getISOWeek, getISOWeekYear, format, parseISO } from 'date-fns'

export function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function nowTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function nowId(): string {
  return new Date().toISOString()
}

export function isoWeek(dateStr: string): number {
  return getISOWeek(parseISO(dateStr))
}

export function isoWeekYear(dateStr: string): number {
  return getISOWeekYear(parseISO(dateStr))
}

export function dayName(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE')
}

export function formatDate(dateStr: string, fmt = 'dd/MM/yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function currentWeek(): { weekNumber: number; year: number } {
  const today = todayDate()
  return { weekNumber: isoWeek(today), year: isoWeekYear(today) }
}
