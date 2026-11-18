import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Vehicle } from '../../types/vehicle'

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="gap-3">
        <span className="w-fit rounded-md border-2 border-foreground bg-background px-2 py-0.5 font-bold tracking-widest uppercase">
          {vehicle.licensePlate}
        </span>
        <CardTitle className="text-lg">
          {vehicle.manufacturer} {vehicle.model}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Year</dt>
          <dd className="tabular-nums">{vehicle.year}</dd>
          <dt className="text-muted-foreground">First registration</dt>
          <dd className="tabular-nums">{vehicle.firstRegistrationDate ?? '—'}</dd>
        </dl>
      </CardContent>
      <CardFooter className="mt-auto justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(vehicle)}>
          <Pencil aria-hidden="true" />
          Edit<span className="sr-only"> {vehicle.licensePlate}</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(vehicle)}>
          <Trash2 aria-hidden="true" />
          Delete<span className="sr-only"> {vehicle.licensePlate}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default VehicleCard
