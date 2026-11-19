import type { DataTableColumn } from '@/components/data-table/DataTable'
import { formatDateTime } from '../../lib/date'
import {
  visitVehicleName,
  type ServiceVisit,
  type ServiceVisitSortField,
} from '../../types/serviceVisit'
import VisitStatusBadge from './VisitStatusBadge'

type VisitColumn = DataTableColumn<ServiceVisit, ServiceVisitSortField>

export const scheduledDateColumn: VisitColumn = {
  id: 'scheduledDate',
  header: 'Scheduled',
  sortField: 'scheduledDate',
  className: 'tabular-nums',
  cell: (visit) => formatDateTime(visit.scheduledDate),
}

export const vehicleColumn: VisitColumn = {
  id: 'vehicle',
  header: 'Vehicle',
  className: 'min-w-28 whitespace-normal',
  cell: (visit) => (
    <div className="flex flex-col">
      <span className="font-medium whitespace-nowrap">{visit.licensePlate}</span>
      <span className="text-xs text-muted-foreground wrap-anywhere">{visitVehicleName(visit)}</span>
    </div>
  ),
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
