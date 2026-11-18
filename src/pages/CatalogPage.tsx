import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import TablePagination from '@/components/data-table/TablePagination'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { getCatalogItems } from '../api/catalog'
import type { SortState } from '../types/api'
import type { CatalogItem, CatalogSortField } from '../types/catalog'

type CatalogFilters = {
  name: string
  minPrice: string
  maxPrice: string
}

const initialFilters: CatalogFilters = { name: '', minPrice: '', maxPrice: '' }
const initialSort: SortState<CatalogSortField> = { field: 'name', direction: 'asc' }

const fetchCatalogPage: FetchPage<CatalogItem, CatalogSortField, CatalogFilters> = (
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
    },
    signal,
  )

const columns: DataTableColumn<CatalogItem, CatalogSortField>[] = [
  {
    id: 'name',
    header: 'Name',
    sortField: 'name',
    className: 'font-medium',
    cell: (item) => item.name,
  },
  {
    id: 'description',
    header: 'Description',
    className: 'min-w-64 whitespace-normal',
    cell: (item) => item.description,
  },
  {
    id: 'price',
    header: 'Price',
    sortField: 'price',
    align: 'right',
    className: 'tabular-nums',
    cell: (item) => item.basePrice.toFixed(2),
  },
  {
    id: 'estimatedHours',
    header: 'Est. hours',
    sortField: 'estimatedHours',
    align: 'right',
    className: 'tabular-nums',
    cell: (item) => item.estimatedHours.toFixed(2),
  },
]

function CatalogPage() {
  const table = useDataTable({
    fetchPage: fetchCatalogPage,
    initialSort,
    initialFilters,
  })

  return (
    <>
      <h1>Services</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Base prices and estimated hours for all our services.
      </p>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_9rem_9rem_auto]"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="catalog-name">Name</Label>
              <Input
                id="catalog-name"
                type="search"
                placeholder="e.g. oil change"
                value={table.filters.name}
                onChange={(event) => table.setFilter('name', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="catalog-min-price">Min price</Label>
              <Input
                id="catalog-min-price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={table.filters.minPrice}
                onChange={(event) => table.setFilter('minPrice', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="catalog-max-price">Max price</Label>
              <Input
                id="catalog-max-price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={table.filters.maxPrice}
                onChange={(event) => table.setFilter('maxPrice', event.target.value)}
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

          <DataTable
            columns={columns}
            rows={table.rows}
            getRowKey={(item) => item.id}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load services: ${table.error}`}
            emptyMessage={
              table.hasActiveFilters ? 'No services match your search.' : 'No services available.'
            }
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
    </>
  )
}

export default CatalogPage
