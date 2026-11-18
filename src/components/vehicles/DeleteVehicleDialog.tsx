import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApiError } from '../../api/client'
import { deleteVehicle } from '../../api/vehicles'
import type { Vehicle } from '../../types/vehicle'

interface DeleteVehicleDialogProps {
  open: boolean
  vehicle: Vehicle | null
  onOpenChange: (open: boolean) => void
  onDeleted: (vehicle: Vehicle) => void
  onRefreshNeeded: () => void
}

function DeleteVehicleDialog({
  open,
  vehicle,
  onOpenChange,
  onDeleted,
  onRefreshNeeded,
}: DeleteVehicleDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDeleting(false)
      setError(null)
      setNotFound(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (deleting) return
    if (!nextOpen && notFound) {
      onRefreshNeeded()
    }
    onOpenChange(nextOpen)
  }

  async function handleDelete() {
    if (!vehicle) return
    setError(null)
    setDeleting(true)
    try {
      await deleteVehicle(vehicle.id)
      setDeleting(false)
      onDeleted(vehicle)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 404) {
          setNotFound(true)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete vehicle?</DialogTitle>
          <DialogDescription>
            {vehicle &&
              `${vehicle.licensePlate} (${vehicle.manufacturer} ${vehicle.model}) will be deleted permanently. This cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting || notFound}
            onClick={handleDelete}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteVehicleDialog
