import { useState, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import SlotPicker from '@/components/visits/SlotPicker'
import { ApiError } from '../../api/client'
import { updateServiceVisit } from '../../api/serviceVisits'
import { formatDateTime, todayIsoDate } from '../../lib/date'
import type { ServiceVisit } from '../../types/serviceVisit'

function initialDate(visit: ServiceVisit | null): string {
  if (!visit) return ''
  const day = visit.scheduledDate.slice(0, 10)
  const today = todayIsoDate()
  return day < today ? today : day
}

interface RescheduleVisitDialogProps {
  open: boolean
  visit: ServiceVisit | null
  onOpenChange: (open: boolean) => void
  onSaved: (visit: ServiceVisit) => void
  onRefreshNeeded: () => void
}

function RescheduleVisitDialog({
  open,
  visit,
  onOpenChange,
  onSaved,
  onRefreshNeeded,
}: RescheduleVisitDialogProps) {
  const [date, setDate] = useState(() => initialDate(visit))
  const [start, setStart] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDate(initialDate(visit))
      setStart(null)
      setSubmitting(false)
      setError(null)
      setFieldErrors({})
      setNotFound(false)
    }
  }

  const leadMechanicId =
    visit?.mechanics.find((mechanic) => mechanic.roleInVisit === 'LEAD')?.mechanicId ?? null

  function handleOpenChange(nextOpen: boolean) {
    if (submitting) return
    if (!nextOpen && notFound) {
      onRefreshNeeded()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!visit || start === null) return
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    try {
      const saved = await updateServiceVisit(visit.id, { scheduledDate: start })
      setSubmitting(false)
      onSaved(saved)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const hasFieldErrors = Object.keys(err.fieldErrors).length > 0
        setFieldErrors(err.fieldErrors)
        setError(hasFieldErrors ? null : err.message)
        if (err.status === 404) {
          setNotFound(true)
        }
        if (err.status === 400 || err.status === 409) {
          setStart(null)
          setReloadKey((key) => key + 1)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reschedule visit</DialogTitle>
          <DialogDescription>
            {visit &&
              `Choose a new day and time for the visit for ${visit.licensePlate}. Currently scheduled: ${formatDateTime(visit.scheduledDate)}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {visit && leadMechanicId === null ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              The lead mechanic of this visit is unknown, so the free times cannot be loaded.
            </p>
          ) : (
            <SlotPicker
              id="reschedule-slot"
              mechanicId={leadMechanicId}
              date={date}
              onDateChange={setDate}
              value={start}
              onChange={setStart}
              excludeVisitId={visit?.id}
              reloadKey={reloadKey}
              error={fieldErrors.scheduledDate}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || notFound || start === null}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RescheduleVisitDialog
