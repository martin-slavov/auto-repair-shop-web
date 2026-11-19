import { CalendarClock, Info, Receipt, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import type { SortState } from '../../types/api'
import {
  MECHANIC_ROLE_LABELS,
  sortMechanicsLeadFirst,
  type ServiceVisit,
  type ServiceVisitSortField,
} from '../../types/serviceVisit'
import {
  completedDateColumn,
  licensePlateColumn,
  scheduledDateColumn,
  statusColumn,
} from './visitColumns'

function mechanicsText(visit: ServiceVisit): string {
  return sortMechanicsLeadFirst(visit.mechanics)
    .map((mechanic) => `${mechanic.mechanicName} (${MECHANIC_ROLE_LABELS[mechanic.roleInVisit]})`)
    .join(', ')
}

interface VisitTableProps {
  rows: ServiceVisit[] | null
  sort: SortState<ServiceVisitSortField>
  onSortChange: (field: ServiceVisitSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  onDetails: (visit: ServiceVisit) => void
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
  onReschedule,
  onDelete,
  onInvoice,
}: VisitTableProps) {
  const columns: DataTableColumn<ServiceVisit, ServiceVisitSortField>[] = [
    scheduledDateColumn,
    licensePlateColumn,
    statusColumn,
    {
      id: 'mechanics',
      header: 'Mechanics',
      className: 'w-full min-w-32 whitespace-normal',
      cell: (visit) => {
        if (visit.mechanics.length === 0) return '—'
        const text = mechanicsText(visit)
        return (
          <div title={text} className="line-clamp-2 wrap-anywhere">
            {text}
          </div>
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
        <div className="flex flex-nowrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onDetails(visit)}>
            <Info aria-hidden="true" />
            Details
            <span className="sr-only"> of the visit for {visit.licensePlate}</span>
          </Button>
          {visit.status === 'SCHEDULED' && (
            <>
              <Button variant="outline" size="sm" onClick={() => onReschedule(visit)}>
                <CalendarClock aria-hidden="true" />
                Reschedule
                <span className="sr-only"> the visit for {visit.licensePlate}</span>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(visit)}>
                <Trash2 aria-hidden="true" />
                Delete
                <span className="sr-only"> the visit for {visit.licensePlate}</span>
              </Button>
            </>
          )}
          {visit.status === 'COMPLETED' && (
            <Button size="sm" onClick={() => onInvoice(visit)}>
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
