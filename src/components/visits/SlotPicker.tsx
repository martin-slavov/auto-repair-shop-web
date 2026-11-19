import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getAvailableSlots } from '../../api/serviceVisits'
import { todayIsoDate } from '../../lib/date'
import type { AvailableSlot } from '../../types/serviceVisit'

const SLOT_COUNT = 15
const GRID_CLASS = 'grid grid-cols-3 gap-2 sm:grid-cols-5'
const MESSAGE_CLASS = 'rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground'

interface SlotsResult {
  key: string
  slots: AvailableSlot[] | null
  error: string | null
}

function isWeekend(date: string): boolean {
  const day = new Date(`${date}T00:00:00`).getDay()
  return day === 0 || day === 6
}

interface SlotPickerProps {
  id: string
  mechanicId: number | null
  date: string
  onDateChange: (date: string) => void
  value: string | null
  onChange: (start: string | null) => void
  excludeVisitId?: number
  reloadKey?: number
  error?: string
}

function SlotPicker({
  id,
  mechanicId,
  date,
  onDateChange,
  value,
  onChange,
  excludeVisitId,
  reloadKey = 0,
  error,
}: SlotPickerProps) {
  const [result, setResult] = useState<SlotsResult | null>(null)
  const dateId = `${id}-date`
  const labelId = `${id}-times-label`
  const errorId = `${id}-error`
  const weekend = date !== '' && isWeekend(date)
  const requestKey =
    mechanicId !== null && date !== '' && !weekend
      ? `${mechanicId}|${date}|${excludeVisitId ?? ''}|${reloadKey}`
      : null

  useEffect(() => {
    if (mechanicId === null || requestKey === null) return
    const controller = new AbortController()
    getAvailableSlots(mechanicId, date, excludeVisitId, controller.signal)
      .then((slots) => setResult({ key: requestKey, slots, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setResult({ key: requestKey, slots: null, error: message })
      })
    return () => controller.abort()
  }, [requestKey, mechanicId, date, excludeVisitId])

  const current = requestKey !== null && result?.key === requestKey ? result : null

  function handleDateChange(nextDate: string) {
    onDateChange(nextDate)
    onChange(null)
  }

  let times: ReactNode
  if (mechanicId === null) {
    times = <p className={MESSAGE_CLASS}>Choose a mechanic to see the free times.</p>
  } else if (date === '') {
    times = <p className={MESSAGE_CLASS}>Choose a day to see the free times.</p>
  } else if (weekend) {
    times = <p className={MESSAGE_CLASS}>The shop is closed on weekends. Choose a weekday.</p>
  } else if (current === null) {
    times = (
      <div aria-busy="true" className={GRID_CLASS}>
        <p className="sr-only">Loading free times…</p>
        {Array.from({ length: SLOT_COUNT }, (_, index) => (
          <div key={index} aria-hidden="true" className="h-8 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  } else if (current.error !== null) {
    times = (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        Could not load free times: {current.error}
      </p>
    )
  } else if (!current.slots?.some((slot) => slot.available)) {
    times = <p className={MESSAGE_CLASS}>No free slots on this day.</p>
  } else {
    times = (
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        className={GRID_CLASS}
      >
        {current.slots.map((slot) => {
          const selected = slot.start === value
          return (
            <Button
              key={slot.start}
              type="button"
              variant={selected ? 'default' : 'outline'}
              aria-pressed={selected}
              disabled={!slot.available}
              onClick={() => onChange(slot.start)}
              className={cn('tabular-nums', !slot.available && 'line-through disabled:opacity-35')}
            >
              {slot.start.slice(11, 16)}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={dateId}>Day</Label>
        <Input
          id={dateId}
          type="date"
          required
          min={todayIsoDate()}
          value={date}
          onChange={(event) => handleDateChange(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p id={labelId} className="text-sm leading-none font-medium">
          Available times
        </p>
        {times}
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default SlotPicker
