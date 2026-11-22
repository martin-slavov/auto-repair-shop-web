import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import { formatDateTime, formatShortDay } from '../../lib/date'
import type { SortState } from '../../types/api'
import {
  PREFERRED_PERIOD_LABELS,
  SERVICE_REQUEST_TYPE_LABELS,
  type ServiceRequest,
  type ServiceRequestSortField,
} from '../../types/serviceRequest'
import ServiceRequestStatusBadge from './ServiceRequestStatusBadge'

interface ServiceRequestTableProps {
  rows: ServiceRequest[] | null
  sort: SortState<ServiceRequestSortField>
  onSortChange: (field: ServiceRequestSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  onApprove: (request: ServiceRequest) => void
  onReject: (request: ServiceRequest) => void
}

function ServiceRequestTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  onApprove,
  onReject,
}: ServiceRequestTableProps) {
  const columns: DataTableColumn<ServiceRequest, ServiceRequestSortField>[] = [
    {
      id: 'createdAt',
      header: 'Created',
      sortField: 'createdAt',
      className: 'tabular-nums',
      cell: (request) => formatDateTime(request.createdAt),
    },
    {
      id: 'licensePlate',
      header: 'License plate',
      className: 'font-medium',
      cell: (request) => request.licensePlate,
    },
    {
      id: 'type',
      header: 'Type',
      sortField: 'type',
      cell: (request) => SERVICE_REQUEST_TYPE_LABELS[request.type],
    },
    {
      id: 'description',
      header: 'Description',
      className: 'w-full min-w-32 whitespace-normal',
      cell: (request) => (
        <div title={request.description} className="line-clamp-2 wrap-anywhere">
          {request.description}
        </div>
      ),
    },
    {
      id: 'preferredDate',
      header: 'Preferred date',
      sortField: 'preferredDate',
      className: 'tabular-nums',
      cell: (request) =>
        request.preferredDate ? (
          <div className="flex flex-col">
            <span>{formatShortDay(request.preferredDate)}</span>
            {request.preferredPeriod && (
              <span className="text-xs text-muted-foreground">
                {PREFERRED_PERIOD_LABELS[request.preferredPeriod]}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">No preference</span>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      sortField: 'status',
      cell: (request) => <ServiceRequestStatusBadge status={request.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      cell: (request) =>
        request.status === 'PENDING' && (
          <div className="flex flex-nowrap justify-end gap-2">
            <Button size="sm" onClick={() => onApprove(request)}>
              <Check aria-hidden="true" />
              Approve<span className="sr-only"> request for {request.licensePlate}</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onReject(request)}>
              <X aria-hidden="true" />
              Reject<span className="sr-only"> request for {request.licensePlate}</span>
            </Button>
          </div>
        ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(request) => request.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  )
}

export default ServiceRequestTable
