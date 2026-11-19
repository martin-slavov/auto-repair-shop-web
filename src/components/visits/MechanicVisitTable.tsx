import { CircleCheck, Info, Play, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import type { SortState } from '../../types/api'
import { SERVICE_REQUEST_TYPE_LABELS } from '../../types/serviceRequest'
import {
  MECHANIC_ROLE_LABELS,
  type ServiceVisit,
  type ServiceVisitSortField,
} from '../../types/serviceVisit'
import {
  completedDateColumn,
  scheduledDateColumn,
  statusColumn,
  vehicleColumn,
} from './visitColumns'
import VisitStatusBadge from './VisitStatusBadge'

interface MechanicVisitTableProps {
  rows: ServiceVisit[] | null
  sort: SortState<ServiceVisitSortField>
  onSortChange: (field: ServiceVisitSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  onDetails: (visit: ServiceVisit) => void
  onStart: (visit: ServiceVisit) => void
  onParts: (visit: ServiceVisit) => void
  onComplete: (visit: ServiceVisit) => void
}

function MechanicVisitTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  onDetails,
  onStart,
  onParts,
  onComplete,
}: MechanicVisitTableProps) {
  const columns: DataTableColumn<ServiceVisit, ServiceVisitSortField>[] = [
    scheduledDateColumn,
    vehicleColumn,
    {
      id: 'work',
      header: 'Work',
      className: 'w-full min-w-40 whitespace-normal',
      cell: (visit) => (
        <div className="flex flex-col">
          {visit.requestType && (
            <span className="text-xs text-muted-foreground">
              {SERVICE_REQUEST_TYPE_LABELS[visit.requestType]}
            </span>
          )}
          {visit.requestDescription ? (
            <span title={visit.requestDescription} className="line-clamp-2 wrap-anywhere">
              {visit.requestDescription}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      ...statusColumn,
      cell: (visit) => (
        <div className="flex flex-col items-start gap-1">
          <VisitStatusBadge status={visit.status} />
          {visit.myRole && (
            <span className="text-xs text-muted-foreground">
              {MECHANIC_ROLE_LABELS[visit.myRole]}
            </span>
          )}
        </div>
      ),
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
            <Button size="sm" onClick={() => onStart(visit)}>
              <Play aria-hidden="true" />
              Start
              <span className="sr-only"> the visit for {visit.licensePlate}</span>
            </Button>
          )}
          {visit.status === 'IN_PROGRESS' && (
            <>
              <Button variant="outline" size="sm" onClick={() => onParts(visit)}>
                <Wrench aria-hidden="true" />
                Parts
                <span className="sr-only"> for the visit for {visit.licensePlate}</span>
              </Button>
              {visit.myRole === 'LEAD' && (
                <Button size="sm" onClick={() => onComplete(visit)}>
                  <CircleCheck aria-hidden="true" />
                  Complete
                  <span className="sr-only"> the visit for {visit.licensePlate}</span>
                </Button>
              )}
            </>
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

export default MechanicVisitTable
