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
import { TEXTAREA_CLASS } from '@/lib/fieldClasses'
import { createCatalogItem, updateCatalogItem } from '../../api/catalog'
import { ApiError } from '../../api/client'
import { decimalMax, validateDecimal } from '../../lib/decimal'
import type { CatalogItem } from '../../types/catalog'

const NAME_MAX = 100
const DESCRIPTION_MAX = 500
const PRICE_DIGITS = 6
const HOURS_DIGITS = 3

interface FormValues {
  name: string
  description: string
  basePrice: string
  estimatedHours: string
  active: boolean
}

function toFormValues(item: CatalogItem | null): FormValues {
  return item
    ? {
        name: item.name,
        description: item.description,
        basePrice: item.basePrice.toFixed(2),
        estimatedHours: item.estimatedHours.toFixed(2),
        active: item.active,
      }
    : { name: '', description: '', basePrice: '', estimatedHours: '', active: true }
}

function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (values.name.trim() === '') errors.name = 'Name is required.'
  if (values.description.trim() === '') errors.description = 'Description is required.'
  const priceError = validateDecimal(values.basePrice, {
    label: 'Base price',
    integerDigits: PRICE_DIGITS,
    allowZero: true,
  })
  if (priceError) errors.basePrice = priceError
  const hoursError = validateDecimal(values.estimatedHours, {
    label: 'Estimated hours',
    integerDigits: HOURS_DIGITS,
  })
  if (hoursError) errors.estimatedHours = hoursError
  return errors
}

interface CatalogItemFormDialogProps {
  open: boolean
  item: CatalogItem | null
  onOpenChange: (open: boolean) => void
  onSaved: (item: CatalogItem, created: boolean) => void
  onRefreshNeeded: () => void
}

function CatalogItemFormDialog({
  open,
  item,
  onOpenChange,
  onSaved,
  onRefreshNeeded,
}: CatalogItemFormDialogProps) {
  const isEdit = item !== null
  const [values, setValues] = useState<FormValues>(() => toFormValues(item))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(toFormValues(item))
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
      description: values.description,
      basePrice: Number(values.basePrice),
      estimatedHours: Number(values.estimatedHours),
    }
    setSubmitting(true)
    try {
      const saved = item
        ? await updateCatalogItem(item.id, { ...body, active: values.active })
        : await createCatalogItem(body)
      setSubmitting(false)
      onSaved(saved, !item)
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
          <DialogTitle>{isEdit ? 'Edit service' : 'Add service'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Change the details shown in the public services catalog.'
              : 'New services are active and appear in the public catalog right away.'}
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

          <FormField id="catalog-name" label="Name" error={fieldErrors.name}>
            <Input
              id="catalog-name"
              type="text"
              maxLength={NAME_MAX}
              required
              value={values.name}
              onChange={(event) => setValue('name', event.target.value)}
              {...fieldErrorProps('catalog-name', fieldErrors.name)}
            />
          </FormField>

          <FormField
            id="catalog-description"
            label="Description"
            error={fieldErrors.description}
            hint={
              <span className="ml-auto text-muted-foreground tabular-nums">
                {values.description.length}/{DESCRIPTION_MAX}
              </span>
            }
          >
            <textarea
              id="catalog-description"
              required
              maxLength={DESCRIPTION_MAX}
              value={values.description}
              onChange={(event) => setValue('description', event.target.value)}
              className={TEXTAREA_CLASS}
              {...fieldErrorProps('catalog-description', fieldErrors.description)}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="catalog-base-price" label="Base price" error={fieldErrors.basePrice}>
              <Input
                id="catalog-base-price"
                type="number"
                inputMode="decimal"
                required
                min={0}
                max={decimalMax(PRICE_DIGITS)}
                step={0.01}
                value={values.basePrice}
                onChange={(event) => setValue('basePrice', event.target.value)}
                {...fieldErrorProps('catalog-base-price', fieldErrors.basePrice)}
              />
            </FormField>
            <FormField
              id="catalog-estimated-hours"
              label="Estimated hours"
              error={fieldErrors.estimatedHours}
            >
              <Input
                id="catalog-estimated-hours"
                type="number"
                inputMode="decimal"
                required
                min={0.01}
                max={decimalMax(HOURS_DIGITS)}
                step={0.01}
                value={values.estimatedHours}
                onChange={(event) => setValue('estimatedHours', event.target.value)}
                {...fieldErrorProps('catalog-estimated-hours', fieldErrors.estimatedHours)}
              />
            </FormField>
          </div>

          {isEdit && (
            <ActiveField
              id="catalog-active"
              checked={values.active}
              onChange={(checked) => setValue('active', checked)}
              hint="Inactive services are hidden from the public catalog."
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
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CatalogItemFormDialog
