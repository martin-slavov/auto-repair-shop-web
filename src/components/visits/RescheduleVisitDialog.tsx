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
import { Input } from '@/components/ui/input'
import FormField from '@/components/FormField'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { ApiError } from '../../api/client'
import { updateServiceVisit } from '../../api/serviceVisits'
import { nowLocalDateTimeMinutes } from '../../lib/date'
import type { ServiceVisit } from '../../types/serviceVisit'

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
  const [scheduledDate, setScheduledDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setScheduledDate(visit ? visit.scheduledDate.slice(0, 16) : '')
      setSubmitting(false)
      setError(null)
      setFieldErrors({})
      setNotFound(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (submitting) return
    if (!nextOpen && notFound) {
      onRefreshNeeded()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!visit) return
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    try {
      const saved = await updateServiceVisit(visit.id, { scheduledDate: `${scheduledDate}:00` })
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
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule visit</DialogTitle>
          <DialogDescription>
            {visit && `Choose a new date and time for the visit for ${visit.licensePlate}.`}
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

          <FormField
            id="reschedule-scheduled-date"
            label="Scheduled date"
            error={fieldErrors.scheduledDate}
          >
            <Input
              id="reschedule-scheduled-date"
              type="datetime-local"
              required
              min={nowLocalDateTimeMinutes()}
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              {...fieldErrorProps('reschedule-scheduled-date', fieldErrors.scheduledDate)}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || notFound}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RescheduleVisitDialog
