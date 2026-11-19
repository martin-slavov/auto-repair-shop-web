import type { ReactNode } from 'react'
import ConfirmActionDialog from './ConfirmActionDialog'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  description: ReactNode
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  onDeleted: () => void
  onRefreshNeeded: () => void
}

function ConfirmDeleteDialog({ onDeleted, ...props }: ConfirmDeleteDialogProps) {
  return (
    <ConfirmActionDialog
      {...props}
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      confirmVariant="destructive"
      onDone={onDeleted}
    />
  )
}

export default ConfirmDeleteDialog
