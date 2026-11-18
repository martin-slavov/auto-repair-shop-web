import type { ReactNode } from 'react'
import DataCardList from '@/components/data-table/DataCardList'
import type { Vehicle } from '../../types/vehicle'
import VehicleCard from './VehicleCard'

interface VehicleCardGridProps {
  rows: Vehicle[] | null
  loading?: boolean
  error?: string | null
  emptyState: ReactNode
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

function VehicleCardGrid({
  rows,
  loading,
  error,
  emptyState,
  onEdit,
  onDelete,
}: VehicleCardGridProps) {
  return (
    <DataCardList
      rows={rows}
      getRowKey={(vehicle) => vehicle.id}
      renderItem={(vehicle) => (
        <VehicleCard vehicle={vehicle} onEdit={onEdit} onDelete={onDelete} />
      )}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      loading={loading}
      error={error}
      emptyState={emptyState}
    />
  )
}

export default VehicleCardGrid
