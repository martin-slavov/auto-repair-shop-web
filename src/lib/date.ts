import { PREFERRED_PERIOD_LABELS, type PreferredPeriod } from '../types/serviceRequest'

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function parseIsoDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00`)
}

export function todayIsoDate(): string {
  return toIsoDate(new Date())
}

export function addDaysIsoDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export function isWeekend(value: string): boolean {
  const day = parseIsoDate(value).getDay()
  return day === 0 || day === 6
}

export function formatShortDay(value: string): string {
  return parseIsoDate(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatPreferred(date: string | null, period: PreferredPeriod | null): string {
  if (!date) return 'No preference'
  const day = formatShortDay(date)
  return period ? `${day}, ${PREFERRED_PERIOD_LABELS[period].toLowerCase()}` : day
}

export function formatDateTime(value: string): string {
  return value.slice(0, 16).replace('T', ' ')
}

export function formatDate(value: string): string {
  return value.slice(0, 10)
}
