import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import PartFormDialog from '@/components/parts/PartFormDialog'
import PartTable from '@/components/parts/PartTable'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { isNumberRangeInvalid, useRangeFilter } from '@/hooks/useRangeFilter'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { deletePart, getAdminParts } from '../api/parts'
import type { SortState } from '../types/api'
import type { PartAdmin, PartAdminSortField } from '../types/part'

const SUCCESS_MESSAGE_MS = 4000
const PRICE_RANGE_ERROR_ID = 'parts-price-range-error'

type AdminPartFilters = {
  name: string
  serialNumber: string
  minPrice: string
  maxPrice: string
  active: '' | 'true' | 'false'
}

const initialFilters: AdminPartFilters = {
  name: '',
  serialNumber: '',
  minPrice: '',
  maxPrice: '',
  active: '',
}
const initialSort: SortState<PartAdminSortField> = { field: 'name', direction: 'asc' }

const fetchAdminPartPage: FetchPage<PartAdmin, PartAdminSortField, AdminPartFilters> = (
  { page, size, sort, filters },
  signal,
) =>
  getAdminParts(
    {
      page,
      size,
      sort: `${sort.field},${sort.direction}`,
      name: filters.name,
      serialNumber: filters.serialNumber,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      active: filters.active === '' ? undefined : filters.active === 'true',
    },
    signal,
  )

function AdminPartsPage() {
  const table = useDataTable({
    fetchPage: fetchAdminPartPage,
    initialSort,
    initialFilters,
  })
  const priceRange = useRangeFilter(isNumberRangeInvalid, ({ from, to }) => {
    table.setFilter('minPrice', from)
    table.setFilter('maxPrice', to)
  })

  const [formOpen, setFormOpen] = useState(false)
  const [formPart, setFormPart] = useState<PartAdmin | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PartAdmin | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [success])

  const canClearFilters = table.hasActiveFilters || !priceRange.isEmpty

  function clearFilters() {
    priceRange.clear()
    table.clearFilters()
  }

  function openCreate() {
    setFormPart(null)
    setFormOpen(true)
  }

  function openEdit(part: PartAdmin) {
    setFormPart(part)
    setFormOpen(true)
  }

  function openDelete(part: PartAdmin) {
    setDeleteTarget(part)
    setDeleteOpen(true)
  }

  function handleSaved(part: PartAdmin, created: boolean) {
    setFormOpen(false)
    setSuccess(`Part ${part.name} was ${created ? 'added' : 'updated'}.`)
    if (!created && table.filters.active !== '') {
      table.refreshAfterRowRemoved()
    } else {
      table.refresh()
    }
  }

  function handleDeleted(part: PartAdmin) {
    setDeleteOpen(false)
    setSuccess(`Part ${part.name} was deleted.`)
    table.refreshAfterRowRemoved()
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Parts</h1>
          <p className="mt-2 text-muted-foreground">
            All parts with cost and sell price. Mechanics only see active parts.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" />
          Add part
        </Button>
      </div>

      {success && (
        <p
          role="status"
          className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {success}
        </p>
      )}

      <Card>
        <CardContent className="flex flex-col gap-6">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_7rem_7rem_8rem_auto]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="parts-filter-name">Name</Label>
                <Input
                  id="parts-filter-name"
                  type="search"
                  value={table.filters.name}
                  onChange={(event) => table.setFilter('name', event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="parts-filter-serial-number">Serial number</Label>
                <Input
                  id="parts-filter-serial-number"
                  type="search"
                  value={table.filters.serialNumber}
                  onChange={(event) => table.setFilter('serialNumber', event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="parts-filter-min-price">Min price</Label>
                <Input
                  id="parts-filter-min-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={priceRange.range.from}
                  onChange={(event) => priceRange.change('from', event.target.value)}
                  aria-invalid={priceRange.invalid}
                  aria-describedby={priceRange.invalid ? PRICE_RANGE_ERROR_ID : undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="parts-filter-max-price">Max price</Label>
                <Input
                  id="parts-filter-max-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={priceRange.range.to}
                  onChange={(event) => priceRange.change('to', event.target.value)}
                  aria-invalid={priceRange.invalid}
                  aria-describedby={priceRange.invalid ? PRICE_RANGE_ERROR_ID : undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="parts-filter-active">Status</Label>
                <select
                  id="parts-filter-active"
                  value={table.filters.active}
                  onChange={(event) =>
                    table.setFilter('active', event.target.value as AdminPartFilters['active'])
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!canClearFilters}
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>

            {priceRange.invalid && (
              <p id={PRICE_RANGE_ERROR_ID} role="alert" className="text-sm text-destructive">
                Min price must not be more than max price
              </p>
            )}
          </form>

          <PartTable
            rows={table.rows}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load parts: ${table.error}`}
            emptyMessage={table.hasActiveFilters ? 'No parts match your filters.' : 'No parts yet.'}
            onEdit={openEdit}
            onDelete={openDelete}
          />
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

      <PartFormDialog
        open={formOpen}
        part={formPart}
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
        onRefreshNeeded={table.refresh}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete part?"
        description={
          deleteTarget &&
          `${deleteTarget.name} (${deleteTarget.serialNumber}) will be deleted permanently. A part that is used in a visit cannot be deleted; edit it and clear Active instead.`
        }
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (deleteTarget) await deletePart(deleteTarget.id)
        }}
        onDeleted={() => {
          if (deleteTarget) handleDeleted(deleteTarget)
        }}
        onRefreshNeeded={table.refresh}
      />
    </>
  )
}

export default AdminPartsPage
