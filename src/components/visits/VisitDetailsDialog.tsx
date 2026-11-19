import { Link } from 'react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '../../lib/date'
import {
  MECHANIC_ROLE_LABELS,
  SERVICE_VISIT_STATUS_LABELS,
  type ServiceVisit,
} from '../../types/serviceVisit'
import VisitStatusStepper from './VisitStatusStepper'

interface VisitDetailsDialogProps {
  open: boolean
  visit: ServiceVisit | null
  onOpenChange: (open: boolean) => void
  audience?: 'customer' | 'admin'
}

function VisitDetailsDialog({
  open,
  visit,
  onOpenChange,
  audience = 'customer',
}: VisitDetailsDialogProps) {
  const totalHours = visit?.mechanics.reduce((sum, mechanic) => sum + mechanic.hoursWorked, 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {visit && (
          <>
            <DialogHeader>
              <DialogTitle>Visit for {visit.licensePlate}</DialogTitle>
              <DialogDescription>
                Status: {SERVICE_VISIT_STATUS_LABELS[visit.status]}
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto">
              <div className="px-1 pt-2">
                <VisitStatusStepper status={visit.status} />
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Scheduled</dt>
                <dd className="tabular-nums">{formatDateTime(visit.scheduledDate)}</dd>
                <dt className="text-muted-foreground">Completed</dt>
                <dd className="tabular-nums">
                  {visit.completedDate ? formatDateTime(visit.completedDate) : '—'}
                </dd>
              </dl>

              <section className="flex flex-col gap-2">
                <h2 className="text-lg">Mechanics</h2>
                {visit.mechanics.length === 0 ? (
                  <p className="text-muted-foreground">No mechanic assigned yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Hours worked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visit.mechanics.map((mechanic, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{mechanic.mechanicName}</TableCell>
                          <TableCell>{MECHANIC_ROLE_LABELS[mechanic.roleInVisit]}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {mechanic.hoursWorked.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    {visit.mechanics.length > 1 && (
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2}>Total</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {totalHours.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                )}
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="text-lg">Technical notes</h2>
                {visit.technicalNotes ? (
                  <p className="break-words whitespace-pre-line">{visit.technicalNotes}</p>
                ) : (
                  <p className="text-muted-foreground">No notes yet.</p>
                )}
              </section>

              {audience === 'customer' && (
                <p className="text-muted-foreground">
                  Parts and prices are listed on the invoice once the visit is invoiced.
                  {visit.status === 'INVOICED' && (
                    <>
                      {' '}
                      <Link to="/invoices" className="font-medium text-primary hover:underline">
                        Go to invoices
                      </Link>
                    </>
                  )}
                </p>
              )}
            </div>

            <DialogFooter showCloseButton />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VisitDetailsDialog
