import { useId } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { SortState } from '../../types/api'
import type { VehicleSortField } from '../../types/vehicle'

const SORT_OPTIONS: { value: VehicleSortField; label: string }[] = [
  { value: 'licensePlate', label: 'License plate' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'model', label: 'Model' },
  { value: 'year', label: 'Year' },
  { value: 'firstRegistrationDate', label: 'First registration' },
]

interface VehicleSortControlProps {
  sort: SortState<VehicleSortField>
  onSortChange: (field: VehicleSortField) => void
}

function VehicleSortControl({ sort, onSortChange }: VehicleSortControlProps) {
  const selectId = useId()
  const ascending = sort.direction === 'asc'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor={selectId}>Sort by</Label>
      <select
        id={selectId}
        value={sort.field}
        onChange={(event) => {
          const field = event.target.value as VehicleSortField
          if (field !== sort.field) onSortChange(field)
        }}
        className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`Sort direction: ${ascending ? 'ascending' : 'descending'}. Change direction`}
        onClick={() => onSortChange(sort.field)}
      >
        {ascending ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
        {ascending ? 'Ascending' : 'Descending'}
      </Button>
    </div>
  )
}

export default VehicleSortControl
