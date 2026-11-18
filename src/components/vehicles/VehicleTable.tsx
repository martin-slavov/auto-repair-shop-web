import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import type { SortState } from '../../types/api'
import type { Vehicle, VehicleSortField } from '../../types/vehicle'

interface VehicleTableProps {
  rows: Vehicle[] | null
  sort: SortState<VehicleSortField>
  onSortChange: (field: VehicleSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

function VehicleTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  onEdit,
  onDelete,
}: VehicleTableProps) {
  const columns: DataTableColumn<Vehicle, VehicleSortField>[] = [
    {
      id: 'licensePlate',
      header: 'License plate',
      sortField: 'licensePlate',
      className: 'font-medium',
      cell: (vehicle) => vehicle.licensePlate,
    },
    {
      id: 'manufacturer',
      header: 'Manufacturer',
      sortField: 'manufacturer',
      cell: (vehicle) => vehicle.manufacturer,
    },
    {
      id: 'model',
      header: 'Model',
      sortField: 'model',
      cell: (vehicle) => vehicle.model,
    },
    {
      id: 'year',
      header: 'Year',
      sortField: 'year',
      align: 'right',
      className: 'tabular-nums',
      cell: (vehicle) => vehicle.year,
    },
    {
      id: 'firstRegistrationDate',
      header: 'First registration',
      sortField: 'firstRegistrationDate',
      className: 'tabular-nums',
      cell: (vehicle) => vehicle.firstRegistrationDate ?? '—',
    },
    {
      id: 'owner',
      header: 'Owner',
      cell: (vehicle) => vehicle.ownerName,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (vehicle) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(vehicle)}>
            <Pencil aria-hidden="true" />
            Edit<span className="sr-only"> {vehicle.licensePlate}</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(vehicle)}>
            <Trash2 aria-hidden="true" />
            Delete<span className="sr-only"> {vehicle.licensePlate}</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(vehicle) => vehicle.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  )
}

export default VehicleTable
