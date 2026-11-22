import { useState, type ReactNode, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import FormField from '@/components/FormField'
import SlotPicker from '@/components/visits/SlotPicker'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { ApiError } from '../../api/client'
import { approveServiceRequest } from '../../api/serviceRequests'
import { formatPreferred, isWeekend, todayIsoDate } from '../../lib/date'
import { SELECT_CLASS } from '../../lib/fieldClasses'
import type { ServiceRequest } from '../../types/serviceRequest'
import type { UserAdmin } from '../../types/user'

interface FormValues {
  mechanicId: string
  date: string
  start: string | null
}

function initialValues(request: ServiceRequest | null): FormValues {
  const preferred = request?.preferredDate?.slice(0, 10) ?? ''
  return {
    mechanicId: '',
    date:
      preferred !== '' && preferred >= todayIsoDate() && !isWeekend(preferred) ? preferred : '',
    start: null,
  }
}

interface ApproveServiceRequestDialogProps {
  open: boolean
  request: ServiceRequest | null
  mechanics: UserAdmin[] | null
  mechanicsError: string | null
  onOpenChange: (open: boolean) => void
  onApproved: (request: ServiceRequest) => void
  onRefreshNeeded: () => void
}

function ApproveServiceRequestDialog({
  open,
  request,
  mechanics,
  mechanicsError,
  onOpenChange,
  onApproved,
  onRefreshNeeded,
}: ApproveServiceRequestDialogProps) {
  const [values, setValues] = useState<FormValues>(() => initialValues(request))
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(initialValues(request))
      setSubmitting(false)
      setError(null)
      setFieldErrors({})
      setNotFound(false)
    }
  }

  function setValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
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
    if (!request || values.start === null) return
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    try {
      const approved = await approveServiceRequest(request.id, {
        mechanicId: Number(values.mechanicId),
        scheduledDate: values.start,
      })
      setSubmitting(false)
      onApproved(approved)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const hasFieldErrors = Object.keys(err.fieldErrors).length > 0
        setFieldErrors(err.fieldErrors)
        setError(hasFieldErrors ? null : err.message)
        if (err.status === 404) {
          setNotFound(true)
        }
        if (err.status === 400 || err.status === 409) {
          setValue('start', null)
          setReloadKey((key) => key + 1)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setSubmitting(false)
    }
  }

  const cancelButton = (
    <Button
      type="button"
      variant="outline"
      disabled={submitting}
      onClick={() => handleOpenChange(false)}
    >
      Cancel
    </Button>
  )

  let body: ReactNode
  if (mechanicsError) {
    body = (
      <>
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          Could not load mechanics: {mechanicsError}
        </p>
        <DialogFooter>{cancelButton}</DialogFooter>
      </>
    )
  } else if (mechanics === null) {
    body = <p className="text-muted-foreground">Loading mechanics…</p>
  } else if (mechanics.length === 0) {
    body = (
      <>
        <p className="text-muted-foreground">
          There are no enabled mechanics. Add or enable a mechanic before approving requests.
        </p>
        <DialogFooter>{cancelButton}</DialogFooter>
      </>
    )
  } else {
    body = (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <FormField id="approve-mechanic" label="Lead mechanic" error={fieldErrors.mechanicId}>
          <select
            id="approve-mechanic"
            required
            value={values.mechanicId}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, mechanicId: event.target.value, start: null }))
            }
            className={SELECT_CLASS}
            {...fieldErrorProps('approve-mechanic', fieldErrors.mechanicId)}
          >
            <option value="" disabled>
              Select a mechanic
            </option>
            {mechanics.map((mechanic) => (
              <option key={mechanic.id} value={mechanic.id}>
                {mechanic.firstName} {mechanic.lastName} ({mechanic.username})
              </option>
            ))}
          </select>
        </FormField>

        {request && (
          <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {request.preferredDate ? (
              <>
                Customer prefers:{' '}
                <span className="font-medium text-foreground">
                  {formatPreferred(request.preferredDate, request.preferredPeriod)}
                </span>
              </>
            ) : (
              'Customer has no preferred date.'
            )}
          </p>
        )}

        <SlotPicker
          id="approve-slot"
          mechanicId={values.mechanicId === '' ? null : Number(values.mechanicId)}
          date={values.date}
          onDateChange={(date) => setValue('date', date)}
          value={values.start}
          onChange={(start) => setValue('start', start)}
          reloadKey={reloadKey}
          error={fieldErrors.scheduledDate}
        />

        <DialogFooter>
          {cancelButton}
          <Button type="submit" disabled={submitting || notFound || values.start === null}>
            {submitting ? 'Approving…' : 'Approve'}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve service request?</DialogTitle>
          <DialogDescription>
            {request &&
              `The request for ${request.licensePlate} will be approved and a scheduled visit will be created.`}
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}

export default ApproveServiceRequestDialog
