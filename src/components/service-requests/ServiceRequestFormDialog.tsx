import { useState, type ReactNode, type SubmitEvent } from 'react'
import { Link } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '../../api/client'
import { createServiceRequest, updateServiceRequest } from '../../api/serviceRequests'
import { todayIsoDate } from '../../lib/date'
import {
  SERVICE_REQUEST_TYPE_LABELS,
  type ServiceRequest,
  type ServiceRequestType,
} from '../../types/serviceRequest'
import type { Vehicle } from '../../types/vehicle'
import { SELECT_CLASS, TEXTAREA_CLASS } from '../../lib/fieldClasses'

const DESCRIPTION_MAX = 500

const TYPE_OPTIONS = Object.entries(SERVICE_REQUEST_TYPE_LABELS) as [ServiceRequestType, string][]

interface FormValues {
  vehicleId: string
  type: ServiceRequestType
  preferredDate: string
  description: string
}

function toFormValues(request: ServiceRequest | null): FormValues {
  return {
    vehicleId: '',
    type: request?.type ?? 'SERVICE',
    preferredDate: request?.preferredDate ?? '',
    description: request?.description ?? '',
  }
}

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}

function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {(error || hint) && (
        <div className="flex justify-between gap-2 text-sm">
          {error ? (
            <p id={`${id}-error`} className="text-destructive">
              {error}
            </p>
          ) : (
            <span />
          )}
          {hint}
        </div>
      )}
    </div>
  )
}

function errorProps(id: string, error: string | undefined) {
  return {
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

interface ServiceRequestFormDialogProps {
  open: boolean
  request: ServiceRequest | null
  vehicles: Vehicle[] | null
  vehiclesError: string | null
  onOpenChange: (open: boolean) => void
  onSaved: (request: ServiceRequest, mode: 'created' | 'updated') => void
  onRefreshNeeded: () => void
}

function ServiceRequestFormDialog({
  open,
  request,
  vehicles,
  vehiclesError,
  onOpenChange,
  onSaved,
  onRefreshNeeded,
}: ServiceRequestFormDialogProps) {
  const isEdit = request !== null

  const [values, setValues] = useState<FormValues>(() => toFormValues(request))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(toFormValues(request))
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
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    const body = {
      description: values.description,
      preferredDate: values.preferredDate || null,
      type: values.type,
    }

    try {
      const saved = isEdit
        ? await updateServiceRequest(request.id, body)
        : await createServiceRequest({ ...body, vehicleId: Number(values.vehicleId) })
      setSubmitting(false)
      onSaved(saved, isEdit ? 'updated' : 'created')
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const hasFieldErrors = Object.keys(err.fieldErrors).length > 0
        setFieldErrors(err.fieldErrors)
        setError(hasFieldErrors ? null : err.message)
        if (err.status === 404 && isEdit) {
          setNotFound(true)
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
  if (!isEdit && vehiclesError) {
    body = (
      <>
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          Could not load your vehicles: {vehiclesError}
        </p>
        <DialogFooter>{cancelButton}</DialogFooter>
      </>
    )
  } else if (!isEdit && vehicles === null) {
    body = <p className="text-muted-foreground">Loading your vehicles…</p>
  } else if (!isEdit && vehicles?.length === 0) {
    body = (
      <>
        <p className="text-muted-foreground">
          You need to add a vehicle before you can create a service request.
        </p>
        <DialogFooter>
          {cancelButton}
          <Link to="/vehicles" className={buttonVariants()}>
            Go to vehicles
          </Link>
        </DialogFooter>
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

        {isEdit ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Vehicle</span>
            <span className="w-fit rounded-md border-2 border-foreground bg-background px-2 py-0.5 font-bold tracking-widest uppercase">
              {request.licensePlate}
            </span>
          </div>
        ) : (
          <Field id="request-vehicle" label="Vehicle" error={fieldErrors.vehicleId}>
            <select
              id="request-vehicle"
              required
              value={values.vehicleId}
              onChange={(event) => setValue('vehicleId', event.target.value)}
              className={SELECT_CLASS}
              {...errorProps('request-vehicle', fieldErrors.vehicleId)}
            >
              <option value="" disabled>
                Select a vehicle
              </option>
              {vehicles?.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} – {vehicle.manufacturer} {vehicle.model}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="request-type" label="Type" error={fieldErrors.type}>
            <select
              id="request-type"
              required
              value={values.type}
              onChange={(event) => setValue('type', event.target.value as ServiceRequestType)}
              className={SELECT_CLASS}
              {...errorProps('request-type', fieldErrors.type)}
            >
              {TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="request-preferred-date"
            label="Preferred date (optional)"
            error={fieldErrors.preferredDate}
          >
            <Input
              id="request-preferred-date"
              type="date"
              min={todayIsoDate()}
              value={values.preferredDate}
              onChange={(event) => setValue('preferredDate', event.target.value)}
              {...errorProps('request-preferred-date', fieldErrors.preferredDate)}
            />
          </Field>
        </div>

        <Field
          id="request-description"
          label="Description"
          error={fieldErrors.description}
          hint={
            <span className="ml-auto text-muted-foreground tabular-nums">
              {values.description.length}/{DESCRIPTION_MAX}
            </span>
          }
        >
          <textarea
            id="request-description"
            required
            maxLength={DESCRIPTION_MAX}
            placeholder="Describe the problem or the work you need."
            value={values.description}
            onChange={(event) => setValue('description', event.target.value)}
            className={TEXTAREA_CLASS}
            {...errorProps('request-description', fieldErrors.description)}
          />
        </Field>

        <DialogFooter>
          {cancelButton}
          <Button type="submit" disabled={submitting || notFound}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create request'}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit service request' : 'New service request'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'You can change a request while it is still pending.'
              : 'Tell us what your vehicle needs. We will get back to you after reviewing it.'}
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}

export default ServiceRequestFormDialog
