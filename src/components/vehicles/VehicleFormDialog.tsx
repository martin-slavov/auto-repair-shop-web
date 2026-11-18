import { useState, type ComponentProps, type SubmitEvent } from 'react'
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
import { Label } from '@/components/ui/label'
import { ApiError } from '../../api/client'
import { createVehicle, updateVehicle } from '../../api/vehicles'
import type { Vehicle } from '../../types/vehicle'

const MIN_YEAR = 1886

interface FormValues {
  licensePlate: string
  manufacturer: string
  model: string
  year: string
  firstRegistrationDate: string
}

function toFormValues(vehicle: Vehicle | null): FormValues {
  return {
    licensePlate: vehicle?.licensePlate ?? '',
    manufacturer: vehicle?.manufacturer ?? '',
    model: vehicle?.model ?? '',
    year: vehicle ? String(vehicle.year) : '',
    firstRegistrationDate: vehicle?.firstRegistrationDate ?? '',
  }
}

function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

interface FieldProps extends ComponentProps<typeof Input> {
  id: string
  label: string
  error?: string
}

function Field({ id, label, error, ...inputProps }: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

interface VehicleFormDialogProps {
  open: boolean
  vehicle: Vehicle | null
  onOpenChange: (open: boolean) => void
  onSaved: (vehicle: Vehicle, mode: 'created' | 'updated') => void
  onRefreshNeeded: () => void
}

function VehicleFormDialog({
  open,
  vehicle,
  onOpenChange,
  onSaved,
  onRefreshNeeded,
}: VehicleFormDialogProps) {
  const isEdit = vehicle !== null

  const [values, setValues] = useState<FormValues>(() => toFormValues(vehicle))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(toFormValues(vehicle))
      setSubmitting(false)
      setError(null)
      setFieldErrors({})
      setNotFound(false)
    }
  }

  function setValue(key: keyof FormValues, value: string) {
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
      licensePlate: values.licensePlate,
      manufacturer: values.manufacturer,
      model: values.model,
      year: Number(values.year),
      firstRegistrationDate: values.firstRegistrationDate || null,
    }

    try {
      const saved = isEdit ? await updateVehicle(vehicle.id, body) : await createVehicle(body)
      setSubmitting(false)
      onSaved(saved, isEdit ? 'updated' : 'created')
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

  const currentYear = new Date().getFullYear()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit vehicle' : 'Add vehicle'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Change the details of ${vehicle.licensePlate}.`
              : 'Enter the details of your vehicle.'}
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

          <Field
            id="vehicle-license-plate"
            label="License plate"
            type="text"
            placeholder="e.g. CA1234AB"
            autoComplete="off"
            maxLength={8}
            required
            value={values.licensePlate}
            onChange={(event) => setValue('licensePlate', event.target.value)}
            error={fieldErrors.licensePlate}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="vehicle-manufacturer"
              label="Manufacturer"
              type="text"
              placeholder="e.g. Volkswagen"
              maxLength={50}
              required
              value={values.manufacturer}
              onChange={(event) => setValue('manufacturer', event.target.value)}
              error={fieldErrors.manufacturer}
            />
            <Field
              id="vehicle-model"
              label="Model"
              type="text"
              placeholder="e.g. Golf"
              maxLength={80}
              required
              value={values.model}
              onChange={(event) => setValue('model', event.target.value)}
              error={fieldErrors.model}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="vehicle-year"
              label="Year"
              type="number"
              inputMode="numeric"
              min={MIN_YEAR}
              max={currentYear}
              step={1}
              required
              value={values.year}
              onChange={(event) => setValue('year', event.target.value)}
              error={fieldErrors.year}
            />
            <Field
              id="vehicle-first-registration"
              label="First registration (optional)"
              type="date"
              max={todayIsoDate()}
              value={values.firstRegistrationDate}
              onChange={(event) => setValue('firstRegistrationDate', event.target.value)}
              error={fieldErrors.firstRegistrationDate}
            />
          </div>

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
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default VehicleFormDialog
