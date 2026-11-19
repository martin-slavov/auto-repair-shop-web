export function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function formatDateTime(value: string): string {
  return value.slice(0, 16).replace('T', ' ')
}

export function formatDate(value: string): string {
  return value.slice(0, 10)
}
