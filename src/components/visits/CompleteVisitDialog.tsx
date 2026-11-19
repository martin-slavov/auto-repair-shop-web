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
import { TEXTAREA_CLASS } from '@/lib/fieldClasses'
import { ApiError } from '../../api/client'
import { completeServiceVisit } from '../../api/serviceVisits'
import { decimalMax, validateDecimal } from '../../lib/decimal'
import type { ServiceVisit } from '../../types/serviceVisit'
import VisitJobSummary from './VisitJobSummary'

const NOTES_MAX = 5000
const HOURS_DIGITS = 3
const HOURS_MAX = decimalMax(HOURS_DIGITS)

interface CompleteVisitDialogProps {
  open: boolean
  visit: ServiceVisit | null
  onOpenChange: (open: boolean) => void
  onCompleted: (visit: ServiceVisit) => void
  onRefreshNeeded: () => void
}

function CompleteVisitDialog({
  open,
  visit,
  onOpenChange,
  onCompleted,
  onRefreshNeeded,
}: CompleteVisitDialogProps) {
  const [technicalNotes, setTechnicalNotes] = useState('')
  const [hoursWorked, setHoursWorked] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTechnicalNotes(visit?.technicalNotes ?? '')
      setHoursWorked('')
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

    const formErrors: Record<string, string> = {}
    if (technicalNotes.trim() === '') {
      formErrors.technicalNotes = 'Technical notes are required.'
    }
    const hoursError = validateDecimal(hoursWorked, {
      label: 'Hours worked',
      integerDigits: HOURS_DIGITS,
    })
    if (hoursError) {
      formErrors.hoursWorked = hoursError
    }
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const saved = await completeServiceVisit(visit.id, {
        technicalNotes,
        hoursWorked: Number(hoursWorked),
      })
      setSubmitting(false)
      onCompleted(saved)
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete visit</DialogTitle>
          <DialogDescription>
            {visit &&
              `Add your technical notes and hours for the visit for ${visit.licensePlate}. The visit will move to Completed.`}
          </DialogDescription>
        </DialogHeader>
        {visit && <VisitJobSummary visit={visit} />}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <FormField
            id="complete-technical-notes"
            label="Technical notes"
            error={fieldErrors.technicalNotes}
            hint={
              <span className="ml-auto text-muted-foreground tabular-nums">
                {technicalNotes.length}/{NOTES_MAX}
              </span>
            }
          >
            <textarea
              id="complete-technical-notes"
              required
              maxLength={NOTES_MAX}
              placeholder="What was done, what was found, recommendations."
              value={technicalNotes}
              onChange={(event) => setTechnicalNotes(event.target.value)}
              className={TEXTAREA_CLASS}
              {...fieldErrorProps('complete-technical-notes', fieldErrors.technicalNotes)}
            />
          </FormField>

          <FormField id="complete-hours-worked" label="Hours worked" error={fieldErrors.hoursWorked}>
            <Input
              id="complete-hours-worked"
              type="number"
              inputMode="decimal"
              required
              min={0.01}
              max={HOURS_MAX}
              step={0.01}
              value={hoursWorked}
              onChange={(event) => setHoursWorked(event.target.value)}
              {...fieldErrorProps('complete-hours-worked', fieldErrors.hoursWorked)}
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
              {submitting ? 'Completing…' : 'Complete visit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CompleteVisitDialog
