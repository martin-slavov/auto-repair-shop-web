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
import ActiveField from '@/components/ActiveField'
import FormField from '@/components/FormField'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { ApiError } from '../../api/client'
import { createPart, updatePart } from '../../api/parts'
import { decimalMax, validateDecimal } from '../../lib/decimal'
import type { PartAdmin } from '../../types/part'

const NAME_MAX = 100
const SERIAL_NUMBER_MAX = 60
const PRICE_DIGITS = 6
const PRICE_MAX = decimalMax(PRICE_DIGITS)

interface FormValues {
  name: string
  serialNumber: string
  unitCost: string
  unitSellPrice: string
  active: boolean
}

function toFormValues(part: PartAdmin | null): FormValues {
  return part
    ? {
        name: part.name,
        serialNumber: part.serialNumber,
        unitCost: part.unitCost.toFixed(2),
        unitSellPrice: part.unitSellPrice.toFixed(2),
        active: part.active,
      }
    : { name: '', serialNumber: '', unitCost: '', unitSellPrice: '', active: true }
}

function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (values.name.trim() === '') errors.name = 'Name is required.'
  if (values.serialNumber.trim() === '') errors.serialNumber = 'Serial number is required.'
  const costError = validateDecimal(values.unitCost, {
    label: 'Unit cost',
    integerDigits: PRICE_DIGITS,
  })
  if (costError) errors.unitCost = costError
  const sellError = validateDecimal(values.unitSellPrice, {
    label: 'Unit sell price',
    integerDigits: PRICE_DIGITS,
  })
  if (sellError) errors.unitSellPrice = sellError
  return errors
}

interface PartFormDialogProps {
  open: boolean
  part: PartAdmin | null
  onOpenChange: (open: boolean) => void
  onSaved: (part: PartAdmin, created: boolean) => void
  onRefreshNeeded: () => void
}

function PartFormDialog({ open, part, onOpenChange, onSaved, onRefreshNeeded }: PartFormDialogProps) {
  const isEdit = part !== null
  const [values, setValues] = useState<FormValues>(() => toFormValues(part))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(toFormValues(part))
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

    const formErrors = validate(values)
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    const body = {
      name: values.name,
      serialNumber: values.serialNumber,
      unitCost: Number(values.unitCost),
      unitSellPrice: Number(values.unitSellPrice),
    }
    setSubmitting(true)
    try {
      const saved = part
        ? await updatePart(part.id, { ...body, active: values.active })
        : await createPart(body)
      setSubmitting(false)
      onSaved(saved, !part)
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
          <DialogTitle>{isEdit ? 'Edit part' : 'Add part'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Price changes apply to parts added to visits from now on.'
              : 'New parts are active and mechanics can add them to visits right away.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <FormField id="part-name" label="Name" error={fieldErrors.name}>
            <Input
              id="part-name"
              type="text"
              maxLength={NAME_MAX}
              required
              value={values.name}
              onChange={(event) => setValue('name', event.target.value)}
              {...fieldErrorProps('part-name', fieldErrors.name)}
            />
          </FormField>

          <FormField id="part-serial-number" label="Serial number" error={fieldErrors.serialNumber}>
            <Input
              id="part-serial-number"
              type="text"
              maxLength={SERIAL_NUMBER_MAX}
              required
              value={values.serialNumber}
              onChange={(event) => setValue('serialNumber', event.target.value)}
              {...fieldErrorProps('part-serial-number', fieldErrors.serialNumber)}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="part-unit-cost" label="Unit cost" error={fieldErrors.unitCost}>
              <Input
                id="part-unit-cost"
                type="number"
                inputMode="decimal"
                required
                min={0.01}
                max={PRICE_MAX}
                step={0.01}
                value={values.unitCost}
                onChange={(event) => setValue('unitCost', event.target.value)}
                {...fieldErrorProps('part-unit-cost', fieldErrors.unitCost)}
              />
            </FormField>
            <FormField
              id="part-unit-sell-price"
              label="Unit sell price"
              error={fieldErrors.unitSellPrice}
            >
              <Input
                id="part-unit-sell-price"
                type="number"
                inputMode="decimal"
                required
                min={0.01}
                max={PRICE_MAX}
                step={0.01}
                value={values.unitSellPrice}
                onChange={(event) => setValue('unitSellPrice', event.target.value)}
                {...fieldErrorProps('part-unit-sell-price', fieldErrors.unitSellPrice)}
              />
            </FormField>
          </div>

          {isEdit && (
            <ActiveField
              id="part-active"
              checked={values.active}
              onChange={(checked) => setValue('active', checked)}
              hint="Inactive parts cannot be added to visits. Lines already on visits stay."
              error={fieldErrors.active}
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
            <Button type="submit" disabled={submitting || notFound}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add part'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PartFormDialog
