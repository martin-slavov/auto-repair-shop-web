import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import SortControl, { type SortOption } from '@/components/data-table/SortControl'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import VehicleFormDialog from '@/components/vehicles/VehicleFormDialog'
import VehicleTable from '@/components/vehicles/VehicleTable'
import VehicleCardGrid from '@/components/vehicles/VehicleCardGrid'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { deleteVehicle, getVehicles } from '../api/vehicles'
import { useAuth } from '../auth/useAuth'
import type { SortState } from '../types/api'
import type { Vehicle, VehicleSortField } from '../types/vehicle'

const SUCCESS_MESSAGE_MS = 4000

type VehicleFilters = {
  licensePlate: string
  manufacturer: string
  model: string
}

const initialFilters: VehicleFilters = { licensePlate: '', manufacturer: '', model: '' }
const initialSort: SortState<VehicleSortField> = { field: 'licensePlate', direction: 'asc' }

const sortOptions: SortOption<VehicleSortField>[] = [
  { value: 'licensePlate', label: 'License plate' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'model', label: 'Model' },
  { value: 'year', label: 'Year' },
  { value: 'firstRegistrationDate', label: 'First registration' },
]

const fetchVehiclePage: FetchPage<Vehicle, VehicleSortField, VehicleFilters> = (
  { page, size, sort, filters },
  signal,
) =>
  getVehicles(
    {
      page,
      size,
      sort: `${sort.field},${sort.direction}`,
      licensePlate: filters.licensePlate,
      manufacturer: filters.manufacturer,
      model: filters.model,
    },
    signal,
  )

interface SuccessMessage {
  text: string
}

function VehiclesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const canCreate = user?.role === 'CUSTOMER'

  const table = useDataTable({
    fetchPage: fetchVehiclePage,
    initialSort,
    initialFilters,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [formVehicle, setFormVehicle] = useState<Vehicle | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [success, setSuccess] = useState<SuccessMessage | null>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [success])

  function openCreate() {
    setFormVehicle(null)
    setFormOpen(true)
  }

  function openEdit(vehicle: Vehicle) {
    setFormVehicle(vehicle)
    setFormOpen(true)
  }

  function openDelete(vehicle: Vehicle) {
    setDeleteTarget(vehicle)
    setDeleteOpen(true)
  }

  function handleSaved(vehicle: Vehicle, mode: 'created' | 'updated') {
    setFormOpen(false)
    const action = mode === 'created' ? 'added' : 'updated'
    setSuccess({ text: `Vehicle ${vehicle.licensePlate} was ${action}.` })
    table.refresh()
  }

  function handleDeleted(vehicle: Vehicle) {
    setDeleteOpen(false)
    setSuccess({ text: `Vehicle ${vehicle.licensePlate} was deleted.` })
    if (table.rows?.length === 1 && table.page > 0) {
      table.setPage(table.page - 1)
    } else {
      table.refresh()
    }
  }

  const loadError = table.error && `Could not load vehicles: ${table.error}`

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Vehicles</h1>
          <p className="mt-2 text-muted-foreground">
            {isAdmin
              ? 'All vehicles registered by customers.'
              : 'The vehicles registered to your account.'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" />
            Add vehicle
          </Button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {success.text}
        </p>
      )}

      <Card>
        <CardContent className="flex flex-col gap-6">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicles-license-plate">License plate</Label>
              <Input
                id="vehicles-license-plate"
                type="search"
                placeholder="e.g. CA1234"
                value={table.filters.licensePlate}
                onChange={(event) => table.setFilter('licensePlate', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicles-manufacturer">Manufacturer</Label>
              <Input
                id="vehicles-manufacturer"
                type="search"
                placeholder="e.g. Volkswagen"
                value={table.filters.manufacturer}
                onChange={(event) => table.setFilter('manufacturer', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicles-model">Model</Label>
              <Input
                id="vehicles-model"
                type="search"
                placeholder="e.g. Golf"
                value={table.filters.model}
                onChange={(event) => table.setFilter('model', event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!table.hasActiveFilters}
              onClick={table.clearFilters}
            >
              Clear filters
            </Button>
          </form>

          {isAdmin ? (
            <VehicleTable
              rows={table.rows}
              sort={table.sort}
              onSortChange={table.toggleSort}
              loading={table.loading}
              error={loadError}
              emptyMessage={
                table.hasActiveFilters
                  ? 'No vehicles match your search.'
                  : 'No vehicles registered yet.'
              }
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ) : (
            <>
              <SortControl
                options={sortOptions}
                sort={table.sort}
                onSortChange={table.toggleSort}
              />
              <VehicleCardGrid
                rows={table.rows}
                loading={table.loading}
                error={loadError}
                emptyState={
                  table.hasActiveFilters ? (
                    <p>No vehicles match your filters.</p>
                  ) : (
                    <>
                      <p>You have no vehicles yet.</p>
                      {canCreate && (
                        <Button onClick={openCreate}>
                          <Plus aria-hidden="true" />
                          Add vehicle
                        </Button>
                      )}
                    </>
                  )
                }
                onEdit={openEdit}
                onDelete={openDelete}
              />
            </>
          )}
        </CardContent>
        <CardFooter>
          <TablePagination
            page={table.page}
            pageSize={table.pageSize}
            totalPages={table.data?.totalPages ?? 0}
            totalElements={table.data?.totalElements ?? 0}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        </CardFooter>
      </Card>

      <VehicleFormDialog
        open={formOpen}
        vehicle={formVehicle}
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
        onRefreshNeeded={table.refresh}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete vehicle?"
        description={
          deleteTarget &&
          `${deleteTarget.licensePlate} (${deleteTarget.manufacturer} ${deleteTarget.model}) will be deleted permanently. This cannot be undone.`
        }
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (deleteTarget) await deleteVehicle(deleteTarget.id)
        }}
        onDeleted={() => {
          if (deleteTarget) handleDeleted(deleteTarget)
        }}
        onRefreshNeeded={table.refresh}
      />
    </>
  )
}

export default VehiclesPage
