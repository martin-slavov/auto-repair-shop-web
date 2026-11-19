import type { DataTableColumn } from '@/components/data-table/DataTable'
import { formatDateTime } from '../../lib/date'
import type { ServiceVisit, ServiceVisitSortField } from '../../types/serviceVisit'
import VisitStatusBadge from './VisitStatusBadge'

type VisitColumn = DataTableColumn<ServiceVisit, ServiceVisitSortField>

export const scheduledDateColumn: VisitColumn = {
  id: 'scheduledDate',
  header: 'Scheduled',
  sortField: 'scheduledDate',
  className: 'tabular-nums',
  cell: (visit) => formatDateTime(visit.scheduledDate),
}

export const licensePlateColumn: VisitColumn = {
  id: 'licensePlate',
  header: 'License plate',
  className: 'font-medium',
  cell: (visit) => visit.licensePlate,
}

export const statusColumn: VisitColumn = {
  id: 'status',
  header: 'Status',
  sortField: 'status',
  cell: (visit) => <VisitStatusBadge status={visit.status} />,
}

export const completedDateColumn: VisitColumn = {
  id: 'completedDate',
  header: 'Completed',
  sortField: 'completedDate',
  className: 'tabular-nums',
  cell: (visit) => (visit.completedDate ? formatDateTime(visit.completedDate) : '—'),
}
