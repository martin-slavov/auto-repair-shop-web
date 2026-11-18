import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Vehicle } from '../../types/vehicle'
import VehicleCard from './VehicleCard'

const GRID_CLASS = 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'

interface VehicleCardGridProps {
  rows: Vehicle[] | null
  loading?: boolean
  error?: string | null
  emptyState: ReactNode
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
  skeletonCards?: number
}

function VehicleCardGrid({
  rows,
  loading = false,
  error = null,
  emptyState,
  onEdit,
  onDelete,
  skeletonCards = 6,
}: VehicleCardGridProps) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {error}
      </p>
    )
  }

  if (rows === null) {
    return (
      <div aria-busy="true" className={GRID_CLASS}>
        <p className="sr-only">Loading…</p>
        {Array.from({ length: skeletonCards }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="h-44 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center text-muted-foreground">
        {emptyState}
      </div>
    )
  }

  return (
    <div aria-busy={loading} className={cn('transition-opacity', loading && 'opacity-60')}>
      {loading && <p className="sr-only">Loading…</p>}
      <div className={GRID_CLASS}>
        {rows.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

export default VehicleCardGrid
