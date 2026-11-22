import { CalendarClock, Info, Receipt, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import { formatDateTime, formatPreferred } from '../../lib/date'
import type { SortState } from '../../types/api'
import {
  MECHANIC_ROLE_LABELS,
  sortMechanicsLeadFirst,
  type ServiceVisit,
  type ServiceVisitSortField,
} from '../../types/serviceVisit'
import {
  completedDateColumn,
  scheduledDateColumn,
  statusColumn,
  vehicleColumn,
} from './visitColumns'

interface VisitTableProps {
  rows: ServiceVisit[] | null
  sort: SortState<ServiceVisitSortField>
  onSortChange: (field: ServiceVisitSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  onDetails: (visit: ServiceVisit) => void
  onMechanics: (visit: ServiceVisit) => void
  onReschedule: (visit: ServiceVisit) => void
  onDelete: (visit: ServiceVisit) => void
  onInvoice: (visit: ServiceVisit) => void
}

function VisitTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  onDetails,
  onMechanics,
  onReschedule,
  onDelete,
  onInvoice,
}: VisitTableProps) {
  const columns: DataTableColumn<ServiceVisit, ServiceVisitSortField>[] = [
    {
      ...scheduledDateColumn,
      className: 'min-w-32 whitespace-normal tabular-nums',
      cell: (visit) => (
        <div className="flex flex-col">
          <span className="whitespace-nowrap">{formatDateTime(visit.scheduledDate)}</span>
          <span className="text-xs text-muted-foreground">
            {visit.preferredDate
              ? `Preferred: ${formatPreferred(visit.preferredDate, visit.preferredPeriod)}`
              : 'No preference'}
          </span>
        </div>
      ),
    },
    vehicleColumn,
    statusColumn,
    {
      id: 'mechanics',
      header: 'Mechanics',
      className: 'w-full min-w-32 whitespace-normal',
      cell: (visit) => {
        if (visit.mechanics.length === 0) return '—'
        return (
          <ul>
            {sortMechanicsLeadFirst(visit.mechanics).map((mechanic, index) => (
              <li key={mechanic.assignmentId ?? index} className="wrap-anywhere">
                {mechanic.mechanicName} ({MECHANIC_ROLE_LABELS[mechanic.roleInVisit]})
              </li>
            ))}
          </ul>
        )
      },
    },
    completedDateColumn,
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      cell: (visit) => (
        <div className="ml-auto grid w-max grid-cols-[repeat(2,7.75rem)] gap-2">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onDetails(visit)}>
            <Info aria-hidden="true" />
            Details
            <span className="sr-only"> of the visit for {visit.licensePlate}</span>
          </Button>
          {(visit.status === 'SCHEDULED' || visit.status === 'IN_PROGRESS') && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onMechanics(visit)}
            >
              <Users aria-hidden="true" />
              Mechanics
              <span className="sr-only"> of the visit for {visit.licensePlate}</span>
            </Button>
          )}
          {visit.status === 'SCHEDULED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onReschedule(visit)}
              >
                <CalendarClock aria-hidden="true" />
                Reschedule
                <span className="sr-only"> the visit for {visit.licensePlate}</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onDelete(visit)}
              >
                <Trash2 aria-hidden="true" />
                Delete
                <span className="sr-only"> the visit for {visit.licensePlate}</span>
              </Button>
            </>
          )}
          {visit.status === 'COMPLETED' && (
            <Button size="sm" className="w-full" onClick={() => onInvoice(visit)}>
              <Receipt aria-hidden="true" />
              Create invoice
              <span className="sr-only"> for {visit.licensePlate}</span>
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(visit) => visit.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  )
}

export default VisitTable
