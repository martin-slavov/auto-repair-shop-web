import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import { formatDateTime } from '../../lib/date'
import type { SortState } from '../../types/api'
import {
  SERVICE_REQUEST_TYPE_LABELS,
  type ServiceRequest,
  type ServiceRequestSortField,
} from '../../types/serviceRequest'
import ServiceRequestStatusBadge from './ServiceRequestStatusBadge'

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
    className: 'min-w-64 whitespace-normal break-words',
    cell: (request) => request.description,
  },
  {
    id: 'preferredDate',
    header: 'Preferred date',
    sortField: 'preferredDate',
    className: 'tabular-nums',
    cell: (request) => request.preferredDate ?? '—',
  },
  {
    id: 'status',
    header: 'Status',
    sortField: 'status',
    cell: (request) => <ServiceRequestStatusBadge status={request.status} />,
  },
]

interface ServiceRequestTableProps {
  rows: ServiceRequest[] | null
  sort: SortState<ServiceRequestSortField>
  onSortChange: (field: ServiceRequestSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
}

function ServiceRequestTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
}: ServiceRequestTableProps) {
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
