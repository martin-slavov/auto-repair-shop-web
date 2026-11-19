import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import AdminCatalogTable from '@/components/catalog/AdminCatalogTable'
import CatalogItemFormDialog from '@/components/catalog/CatalogItemFormDialog'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { isNumberRangeInvalid, useRangeFilter } from '@/hooks/useRangeFilter'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { deleteCatalogItem, getCatalogItems } from '../api/catalog'
import type { SortState } from '../types/api'
import type { CatalogItem, CatalogSortField } from '../types/catalog'

const SUCCESS_MESSAGE_MS = 4000
const PRICE_RANGE_ERROR_ID = 'catalog-price-range-error'

type AdminCatalogFilters = {
  name: string
  minPrice: string
  maxPrice: string
  active: '' | 'true' | 'false'
}

const initialFilters: AdminCatalogFilters = { name: '', minPrice: '', maxPrice: '', active: '' }
const initialSort: SortState<CatalogSortField> = { field: 'name', direction: 'asc' }

const fetchAdminCatalogPage: FetchPage<CatalogItem, CatalogSortField, AdminCatalogFilters> = (
  { page, size, sort, filters },
  signal,
) =>
  getCatalogItems(
    {
      page,
      size,
      sort: `${sort.field},${sort.direction}`,
      name: filters.name,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      active: filters.active === '' ? undefined : filters.active === 'true',
    },
    signal,
  )

function AdminCatalogPage() {
  const table = useDataTable({
    fetchPage: fetchAdminCatalogPage,
    initialSort,
    initialFilters,
  })
  const priceRange = useRangeFilter(isNumberRangeInvalid, ({ from, to }) => {
    table.setFilter('minPrice', from)
    table.setFilter('maxPrice', to)
  })

  const [formOpen, setFormOpen] = useState(false)
  const [formItem, setFormItem] = useState<CatalogItem | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null)
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
    setFormItem(null)
    setFormOpen(true)
  }

  function openEdit(item: CatalogItem) {
    setFormItem(item)
    setFormOpen(true)
  }

  function openDelete(item: CatalogItem) {
    setDeleteTarget(item)
    setDeleteOpen(true)
  }

  function handleSaved(item: CatalogItem, created: boolean) {
    setFormOpen(false)
    setSuccess(`Service ${item.name} was ${created ? 'added' : 'updated'}.`)
    if (!created && table.filters.active !== '') {
      table.refreshAfterRowRemoved()
    } else {
      table.refresh()
    }
  }

  function handleDeleted(item: CatalogItem) {
    setDeleteOpen(false)
    setSuccess(`Service ${item.name} was deleted.`)
    table.refreshAfterRowRemoved()
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Catalog</h1>
          <p className="mt-2 text-muted-foreground">
            All services, including inactive ones that the public catalog hides.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" />
          Add service
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
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_8rem_8rem_9rem_auto]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="catalog-filter-name">Name</Label>
                <Input
                  id="catalog-filter-name"
                  type="search"
                  value={table.filters.name}
                  onChange={(event) => table.setFilter('name', event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="catalog-filter-min-price">Min price</Label>
                <Input
                  id="catalog-filter-min-price"
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
                <Label htmlFor="catalog-filter-max-price">Max price</Label>
                <Input
                  id="catalog-filter-max-price"
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
                <Label htmlFor="catalog-filter-active">Status</Label>
                <select
                  id="catalog-filter-active"
                  value={table.filters.active}
                  onChange={(event) =>
                    table.setFilter('active', event.target.value as AdminCatalogFilters['active'])
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

          <AdminCatalogTable
            rows={table.rows}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load services: ${table.error}`}
            emptyMessage={
              table.hasActiveFilters ? 'No services match your filters.' : 'No services yet.'
            }
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

      <CatalogItemFormDialog
        open={formOpen}
        item={formItem}
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
        onRefreshNeeded={table.refresh}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete service?"
        description={
          deleteTarget &&
          `${deleteTarget.name} will be deleted permanently. This cannot be undone. To hide it from customers instead, edit it and clear Active.`
        }
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (deleteTarget) await deleteCatalogItem(deleteTarget.id)
        }}
        onDeleted={() => {
          if (deleteTarget) handleDeleted(deleteTarget)
        }}
        onRefreshNeeded={table.refresh}
      />
    </>
  )
}

export default AdminCatalogPage
