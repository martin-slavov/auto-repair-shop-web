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
import type { AssistantHours, ServiceVisit } from '../../types/serviceVisit'
import VisitJobSummary from './VisitJobSummary'

const NOTES_MAX = 5000
const HOURS_DIGITS = 3
const HOURS_MAX = decimalMax(HOURS_DIGITS)

function assistantFieldKey(assignmentId: number): string {
  return `assistant-${assignmentId}`
}

function mapServerFieldErrors(
  fieldErrors: Record<string, string>,
  sent: AssistantHours[],
): Record<string, string> {
  const mapped: Record<string, string> = {}
  for (const [key, message] of Object.entries(fieldErrors)) {
    const match = /^assistantHours[(d+)]/.exec(key)
    const entry = match ? sent[Number(match[1])] : undefined
    mapped[entry ? assistantFieldKey(entry.assignmentId) : key] = message
  }
  return mapped
}

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
  const [assistantHours, setAssistantHours] = useState<Record<number, string>>({})
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
      setAssistantHours({})
      setSubmitting(false)
      setError(null)
      setFieldErrors({})
      setNotFound(false)
    }
  }

  const assistants = (visit?.mechanics ?? []).flatMap((mechanic) =>
    mechanic.roleInVisit === 'ASSISTANT' && mechanic.assignmentId !== null
      ? [{ assignmentId: mechanic.assignmentId, name: mechanic.mechanicName }]
      : [],
  )
  const hasAssistants = assistants.length > 0

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
    for (const assistant of assistants) {
      const assistantError = validateDecimal(assistantHours[assistant.assignmentId] ?? '', {
        label: 'Hours worked',
        integerDigits: HOURS_DIGITS,
      })
      if (assistantError) {
        formErrors[assistantFieldKey(assistant.assignmentId)] = assistantError
      }
    }
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    const sentAssistantHours: AssistantHours[] = assistants.map((assistant) => ({
      assignmentId: assistant.assignmentId,
      hoursWorked: Number(assistantHours[assistant.assignmentId]),
    }))

    setSubmitting(true)
    try {
      const saved = await completeServiceVisit(visit.id, {
        technicalNotes,
        hoursWorked: Number(hoursWorked),
        ...(hasAssistants && { assistantHours: sentAssistantHours }),
      })
      setSubmitting(false)
      onCompleted(saved)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const hasFieldErrors = Object.keys(err.fieldErrors).length > 0
        setFieldErrors(mapServerFieldErrors(err.fieldErrors, sentAssistantHours))
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
              (hasAssistants
                ? `Add the technical notes, your hours and the hours of each assistant for the visit for ${visit.licensePlate}. The visit will move to Completed.`
                : `Add your technical notes and hours for the visit for ${visit.licensePlate}. The visit will move to Completed.`)}
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

          <FormField
            id="complete-hours-worked"
            label={hasAssistants ? 'Your hours' : 'Hours worked'}
            error={fieldErrors.hoursWorked}
          >
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

          {hasAssistants && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-medium">Assistant hours</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {assistants.map((assistant) => {
                  const key = assistantFieldKey(assistant.assignmentId)
                  const id = `complete-${key}`
                  return (
                    <FormField key={key} id={id} label={assistant.name} error={fieldErrors[key]}>
                      <Input
                        id={id}
                        type="number"
                        inputMode="decimal"
                        required
                        min={0.01}
                        max={HOURS_MAX}
                        step={0.01}
                        value={assistantHours[assistant.assignmentId] ?? ''}
                        onChange={(event) =>
                          setAssistantHours((prev) => ({
                            ...prev,
                            [assistant.assignmentId]: event.target.value,
                          }))
                        }
                        {...fieldErrorProps(id, fieldErrors[key])}
                      />
                    </FormField>
                  )
                })}
              </div>
            </fieldset>
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
