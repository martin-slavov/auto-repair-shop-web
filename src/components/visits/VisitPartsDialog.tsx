import { useState, type SubmitEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ConfirmActionDialog from '@/components/ConfirmActionDialog'
import FormField from '@/components/FormField'
import { useVisitParts } from '@/hooks/useVisitParts'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { ApiError } from '../../api/client'
import { addVisitPart, deleteVisitPart, updateVisitPart } from '../../api/serviceVisits'
import { formatMoney } from '../../lib/money'
import type { PartCatalog } from '../../types/part'
import type { ServiceVisit, VisitPart } from '../../types/serviceVisit'
import PartPicker from './PartPicker'

const QUANTITY_MAX = 2147483647
const QUANTITY_ERROR = 'Quantity must be a whole number greater than zero.'
const OWN_FIELD_MESSAGES: Record<string, string> = {
  partId: 'Choose a part.',
  quantity: QUANTITY_ERROR,
}

function isValidQuantity(value: string): boolean {
  return /^\d+$/.test(value.trim()) && Number(value) > 0 && Number(value) <= QUANTITY_MAX
}

function ownFieldErrors(fieldErrors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, message]) => [
      field,
      OWN_FIELD_MESSAGES[field] ?? message,
    ]),
  )
}

function withoutKey(errors: Record<string, string>, key: string): Record<string, string> {
  const next = { ...errors }
  delete next[key]
  return next
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong'
}

interface VisitPartsDialogProps {
  open: boolean
  visit: ServiceVisit | null
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

function VisitPartsDialog({ open, visit, onOpenChange, onChanged }: VisitPartsDialogProps) {
  const { parts, error: loadError, loading, reload } = useVisitParts(open && visit ? visit.id : null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [changed, setChanged] = useState(false)

  const [selectedPart, setSelectedPart] = useState<PartCatalog | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [removeOpen, setRemoveOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<VisitPart | null>(null)

  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setError(null)
      setSuccess(null)
      setChanged(false)
      setSelectedPart(null)
      setQuantity('1')
      setAddErrors({})
      setAdding(false)
      setEditingId(null)
      setEditError(null)
      setSaving(false)
      setRemoveOpen(false)
    }
  }

  const busy = adding || saving

  function markChanged(message: string) {
    setChanged(true)
    setSuccess(message)
    reload()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (busy) return
    if (!nextOpen && changed) {
      onChanged()
    }
    onOpenChange(nextOpen)
  }

  async function handleAdd(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!visit) return
    setError(null)
    setSuccess(null)

    const formErrors: Record<string, string> = {}
    if (!selectedPart) formErrors.partId = OWN_FIELD_MESSAGES.partId
    if (!isValidQuantity(quantity)) formErrors.quantity = QUANTITY_ERROR
    setAddErrors(formErrors)
    if (!selectedPart || Object.keys(formErrors).length > 0) return

    setAdding(true)
    try {
      const line = await addVisitPart(visit.id, {
        partId: selectedPart.id,
        quantity: Number(quantity),
      })
      setAdding(false)
      setSelectedPart(null)
      setQuantity('1')
      markChanged(`${line.partName} × ${line.quantity} was added.`)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const hasFieldErrors = Object.keys(err.fieldErrors).length > 0
        setAddErrors(ownFieldErrors(err.fieldErrors))
        setError(hasFieldErrors ? null : err.message)
        if (!hasFieldErrors) setChanged(true)
        if (err.status === 404) reload()
      } else {
        setError(errorMessage(err))
      }
      setAdding(false)
    }
  }

  function startEdit(line: VisitPart) {
    setEditingId(line.id)
    setEditQuantity(String(line.quantity))
    setEditError(null)
    setError(null)
    setSuccess(null)
  }

  async function saveEdit(line: VisitPart) {
    if (!visit) return
    setError(null)
    setSuccess(null)
    if (!isValidQuantity(editQuantity)) {
      setEditError(QUANTITY_ERROR)
      return
    }
    setEditError(null)
    setSaving(true)
    try {
      const saved = await updateVisitPart(visit.id, line.id, { quantity: Number(editQuantity) })
      setSaving(false)
      setEditingId(null)
      markChanged(`Quantity of ${saved.partName} was changed to ${saved.quantity}.`)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.quantity) {
          setEditError(QUANTITY_ERROR)
        } else {
          setError(err.message)
          setChanged(true)
        }
        if (err.status === 404) {
          setEditingId(null)
          reload()
        }
      } else {
        setError(errorMessage(err))
      }
      setSaving(false)
    }
  }

  function openRemove(line: VisitPart) {
    setError(null)
    setSuccess(null)
    setEditingId(null)
    setRemoveTarget(line)
    setRemoveOpen(true)
  }

  const total = parts?.reduce((sum, line) => sum + line.priceAtTimeOfUse, 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Parts{visit && ` for ${visit.licensePlate}`}</DialogTitle>
          <DialogDescription>
            Parts used on this visit. Prices are set when a part is added.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto px-1 [scrollbar-gutter:stable]">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              {success}
            </p>
          )}

          <section className="flex flex-col gap-2">
            <h2 className="text-lg">Used parts</h2>
            {loadError ? (
              <p className="text-destructive">Could not load parts: {loadError}</p>
            ) : parts === null ? (
              <p className="text-muted-foreground">Loading parts…</p>
            ) : parts.length === 0 ? (
              <p className="text-muted-foreground">No parts added yet.</p>
            ) : (
              <Table aria-busy={loading}>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Part</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Line total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((line) => {
                    const editing = editingId === line.id
                    const quantityInputId = `visit-part-quantity-${line.id}`
                    return (
                      <TableRow key={line.id}>
                        <TableCell className="w-full whitespace-normal font-medium">
                          <div className="wrap-anywhere">{line.partName}</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {editing ? (
                            <div className="flex flex-col items-end gap-1">
                              <label htmlFor={quantityInputId} className="sr-only">
                                Quantity of {line.partName}
                              </label>
                              <Input
                                id={quantityInputId}
                                type="number"
                                inputMode="numeric"
                                min={1}
                                step={1}
                                value={editQuantity}
                                disabled={saving}
                                onChange={(event) => setEditQuantity(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault()
                                    void saveEdit(line)
                                  }
                                }}
                                className="w-20 text-right"
                                {...fieldErrorProps(quantityInputId, editError ?? undefined)}
                              />
                              {editError && (
                                <p
                                  id={`${quantityInputId}-error`}
                                  className="max-w-40 text-right text-xs whitespace-normal text-destructive"
                                >
                                  {editError}
                                </p>
                              )}
                            </div>
                          ) : (
                            line.quantity
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoney(line.priceAtTimeOfUse)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {editing ? (
                            <div className="flex flex-nowrap justify-end gap-2">
                              <Button
                                size="sm"
                                disabled={saving}
                                onClick={() => void saveEdit(line)}
                              >
                                {saving ? 'Saving…' : 'Save'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={saving}
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-nowrap justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy}
                                onClick={() => startEdit(line)}
                              >
                                <Pencil aria-hidden="true" />
                                Change
                                <span className="sr-only"> quantity of {line.partName}</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={busy}
                                onClick={() => openRemove(line)}
                              >
                                <Trash2 aria-hidden="true" />
                                Remove
                                <span className="sr-only"> {line.partName}</span>
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Parts total</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(total)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg">Add a part</h2>
            <form onSubmit={handleAdd} noValidate className="flex flex-col gap-4">
              <PartPicker
                id="visit-part-search"
                selected={selectedPart}
                onSelect={(part) => {
                  setSelectedPart(part)
                  setAddErrors((prev) => withoutKey(prev, 'partId'))
                }}
                error={addErrors.partId}
                disabled={adding}
              />
              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_8rem_auto]">
                <p className="text-sm sm:self-center">
                  {selectedPart ? (
                    <>
                      Selected: <span className="font-medium">{selectedPart.name}</span> (
                      {formatMoney(selectedPart.unitSellPrice)} each)
                    </>
                  ) : (
                    <span className="text-muted-foreground">No part selected.</span>
                  )}
                </p>
                <FormField id="visit-part-quantity" label="Quantity" error={addErrors.quantity}>
                  <Input
                    id="visit-part-quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    required
                    value={quantity}
                    disabled={adding}
                    onChange={(event) => {
                      setQuantity(event.target.value)
                      setAddErrors((prev) => withoutKey(prev, 'quantity'))
                    }}
                    {...fieldErrorProps('visit-part-quantity', addErrors.quantity)}
                  />
                </FormField>
                <Button type="submit" disabled={busy}>
                  <Plus aria-hidden="true" />
                  {adding ? 'Adding…' : 'Add part'}
                </Button>
              </div>
            </form>
          </section>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>

        <ConfirmActionDialog
          open={removeOpen}
          title="Remove part?"
          description={
            removeTarget &&
            `${removeTarget.partName} × ${removeTarget.quantity} will be removed from this visit.`
          }
          confirmLabel="Remove"
          pendingLabel="Removing…"
          confirmVariant="destructive"
          onOpenChange={setRemoveOpen}
          onConfirm={async () => {
            if (visit && removeTarget) await deleteVisitPart(visit.id, removeTarget.id)
          }}
          onDone={() => {
            setRemoveOpen(false)
            if (removeTarget) markChanged(`${removeTarget.partName} was removed.`)
          }}
          onRefreshNeeded={() => {
            setChanged(true)
            reload()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default VisitPartsDialog
