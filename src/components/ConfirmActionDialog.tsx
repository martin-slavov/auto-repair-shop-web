import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApiError } from '../api/client'

export interface ConfirmActionDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  pendingLabel: string
  confirmVariant?: 'default' | 'destructive'
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  onDone: () => void
  onRefreshNeeded: () => void
}

function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  confirmVariant = 'default',
  onOpenChange,
  onConfirm,
  onDone,
  onRefreshNeeded,
}: ConfirmActionDialogProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPending(false)
      setError(null)
      setNotFound(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return
    if (!nextOpen && notFound) {
      onRefreshNeeded()
    }
    onOpenChange(nextOpen)
  }

  async function handleConfirm() {
    setError(null)
    setPending(true)
    try {
      await onConfirm()
      setPending(false)
      onDone()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 404) {
          setNotFound(true)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={pending || notFound}
            onClick={handleConfirm}
          >
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmActionDialog
