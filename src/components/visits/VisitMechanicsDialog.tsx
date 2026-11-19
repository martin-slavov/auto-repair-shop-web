import { useState, type ReactNode, type SubmitEvent } from 'react'
import { Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ConfirmActionDialog from '@/components/ConfirmActionDialog'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { ApiError } from '../../api/client'
import { addVisitAssistant, removeVisitAssistant } from '../../api/serviceVisits'
import {
  MECHANIC_ROLE_LABELS,
  sortMechanicsLeadFirst,
  type MechanicAssignment,
  type ServiceVisit,
} from '../../types/serviceVisit'
import type { UserAdmin } from '../../types/user'

const MAX_ASSISTANTS = 3

interface VisitMechanicsDialogProps {
  open: boolean
  visit: ServiceVisit | null
  mechanics: UserAdmin[] | null
  mechanicsError: string | null
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

function VisitMechanicsDialog({
  open,
  visit,
  mechanics,
  mechanicsError,
  onOpenChange,
  onChanged,
}: VisitMechanicsDialogProps) {
  const [current, setCurrent] = useState<ServiceVisit | null>(visit)
  const [selectedId, setSelectedId] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<MechanicAssignment | null>(null)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCurrent(visit)
      setSelectedId('')
      setAdding(false)
      setError(null)
      setSuccess(null)
      setNotFound(false)
      setRemoveOpen(false)
      setRemoveTarget(null)
    }
  }

  const assigned = current ? sortMechanicsLeadFirst(current.mechanics) : []
  const assistantCount = assigned.filter((mechanic) => mechanic.roleInVisit === 'ASSISTANT').length
  const assignedIds = new Set(assigned.map((mechanic) => mechanic.mechanicId))
  const candidates =
    mechanics?.filter((mechanic) => mechanic.enabled && !assignedIds.has(mechanic.id)) ?? []
  const limitReached = assistantCount >= MAX_ASSISTANTS

  function handleOpenChange(nextOpen: boolean) {
    if (adding) return
    if (!nextOpen && notFound) {
      onChanged()
    }
    onOpenChange(nextOpen)
  }

  async function handleAdd(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!current || selectedId === '') return
    const mechanic = mechanics?.find((candidate) => candidate.id === Number(selectedId))
    setError(null)
    setSuccess(null)
    setAdding(true)
    try {
      const updated = await addVisitAssistant(current.id, Number(selectedId))
      setCurrent(updated)
      setSelectedId('')
      setSuccess(
        mechanic
          ? `${mechanic.firstName} ${mechanic.lastName} was added as an assistant.`
          : 'The assistant was added.',
      )
      onChanged()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 404) {
          setNotFound(true)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }
    setAdding(false)
  }

  function openRemove(mechanic: MechanicAssignment) {
    setError(null)
    setSuccess(null)
    setRemoveTarget(mechanic)
    setRemoveOpen(true)
  }

  let addArea: ReactNode
  if (mechanicsError) {
    addArea = <p className="text-destructive">Could not load mechanics: {mechanicsError}</p>
  } else if (mechanics === null) {
    addArea = <p className="text-muted-foreground">Loading mechanics…</p>
  } else if (limitReached) {
    addArea = (
      <p className="text-muted-foreground">
        A visit can have at most {MAX_ASSISTANTS} assistants.
      </p>
    )
  } else if (candidates.length === 0) {
    addArea = (
      <p className="text-muted-foreground">There are no other enabled mechanics to add.</p>
    )
  } else {
    addArea = (
      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <Label htmlFor="visit-add-assistant">Add an assistant</Label>
        <div className="flex gap-2">
          <select
            id="visit-add-assistant"
            required
            value={selectedId}
            disabled={adding || notFound}
            onChange={(event) => setSelectedId(event.target.value)}
            className={`min-w-0 flex-1 ${SELECT_CLASS}`}
          >
            <option value="" disabled>
              Select a mechanic
            </option>
            {candidates.map((mechanic) => (
              <option key={mechanic.id} value={mechanic.id}>
                {mechanic.firstName} {mechanic.lastName} ({mechanic.username})
              </option>
            ))}
          </select>
          <Button type="submit" disabled={adding || notFound || selectedId === ''}>
            <UserPlus aria-hidden="true" />
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mechanics{current && ` for ${current.licensePlate}`}</DialogTitle>
          <DialogDescription>
            The lead mechanic is set when the request is approved. Add up to {MAX_ASSISTANTS}{' '}
            assistants who are free at the visit&apos;s time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
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
              className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-text"
            >
              {success}
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assigned.map((mechanic, index) => (
                <TableRow key={mechanic.assignmentId ?? index}>
                  <TableCell className="w-full whitespace-normal font-medium">
                    <div className="wrap-anywhere">{mechanic.mechanicName}</div>
                  </TableCell>
                  <TableCell>{MECHANIC_ROLE_LABELS[mechanic.roleInVisit]}</TableCell>
                  <TableCell className="text-right">
                    {mechanic.roleInVisit === 'ASSISTANT' && mechanic.mechanicId !== null && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={adding || notFound}
                        onClick={() => openRemove(mechanic)}
                      >
                        <Trash2 aria-hidden="true" />
                        Remove<span className="sr-only"> {mechanic.mechanicName}</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {addArea}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={adding}
            onClick={() => handleOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>

        <ConfirmActionDialog
          open={removeOpen}
          title="Remove assistant?"
          description={
            removeTarget &&
            current &&
            `${removeTarget.mechanicName} will be removed from the visit for ${current.licensePlate}.`
          }
          confirmLabel="Remove"
          pendingLabel="Removing…"
          confirmVariant="destructive"
          onOpenChange={setRemoveOpen}
          onConfirm={async () => {
            const mechanicId = removeTarget?.mechanicId ?? null
            if (current && mechanicId !== null) {
              setCurrent(await removeVisitAssistant(current.id, mechanicId))
            }
          }}
          onDone={() => {
            setRemoveOpen(false)
            if (removeTarget) setSuccess(`${removeTarget.mechanicName} was removed.`)
            onChanged()
          }}
          onRefreshNeeded={onChanged}
        />
      </DialogContent>
    </Dialog>
  )
}

export default VisitMechanicsDialog
