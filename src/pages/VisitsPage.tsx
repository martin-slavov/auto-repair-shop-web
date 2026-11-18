import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import DataCardList from '@/components/data-table/DataCardList'
import SortControl, { type SortOption } from '@/components/data-table/SortControl'
import VisitCard from '@/components/visits/VisitCard'
import VisitDetailsDialog from '@/components/visits/VisitDetailsDialog'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { getServiceVisits } from '../api/serviceVisits'
import type { SortState } from '../types/api'
import {
  SERVICE_VISIT_STATUS_LABELS,
  SERVICE_VISIT_STATUS_ORDER,
  type ServiceVisit,
  type ServiceVisitSortField,
  type ServiceVisitStatus,
} from '../types/serviceVisit'

type VisitFilters = {
  licensePlate: string
  status: ServiceVisitStatus | ''
}

const initialFilters: VisitFilters = { licensePlate: '', status: '' }
const initialSort: SortState<ServiceVisitSortField> = { field: 'scheduledDate', direction: 'desc' }

const sortOptions: SortOption<ServiceVisitSortField>[] = [
  { value: 'scheduledDate', label: 'Scheduled date' },
  { value: 'completedDate', label: 'Completed date' },
  { value: 'status', label: 'Status' },
]

const fetchVisitPage: FetchPage<ServiceVisit, ServiceVisitSortField, VisitFilters> = (
  { page, size, sort, filters },
  signal,
) =>
  getServiceVisits(
    {
      page,
      size,
      sort: `${sort.field},${sort.direction}`,
      licensePlate: filters.licensePlate,
      status: filters.status,
    },
    signal,
  )

function VisitsPage() {
  const table = useDataTable({
    fetchPage: fetchVisitPage,
    initialSort,
    initialFilters,
  })

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsVisit, setDetailsVisit] = useState<ServiceVisit | null>(null)

  function openDetails(visit: ServiceVisit) {
    setDetailsVisit(visit)
    setDetailsOpen(true)
  }

  return (
    <>
      <h1>Visits</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Follow your vehicles' visits from scheduling to invoice.
      </p>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_12rem_auto]"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="visits-license-plate">License plate</Label>
              <Input
                id="visits-license-plate"
                type="search"
                placeholder="e.g. CA1234"
                value={table.filters.licensePlate}
                onChange={(event) => table.setFilter('licensePlate', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visits-status">Status</Label>
              <select
                id="visits-status"
                value={table.filters.status}
                onChange={(event) =>
                  table.setFilter('status', event.target.value as ServiceVisitStatus | '')
                }
                className={SELECT_CLASS}
              >
                <option value="">All</option>
                {SERVICE_VISIT_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {SERVICE_VISIT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
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

          <SortControl options={sortOptions} sort={table.sort} onSortChange={table.toggleSort} />

          <DataCardList
            rows={table.rows}
            getRowKey={(visit) => visit.id}
            renderItem={(visit) => <VisitCard visit={visit} onDetails={openDetails} />}
            className="flex flex-col gap-4"
            skeletonCount={3}
            skeletonClassName="h-40"
            loading={table.loading}
            error={table.error && `Could not load visits: ${table.error}`}
            emptyState={
              <p>
                {table.hasActiveFilters
                  ? 'No visits match your filters.'
                  : 'You have no service visits yet.'}
              </p>
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

      <VisitDetailsDialog open={detailsOpen} visit={detailsVisit} onOpenChange={setDetailsOpen} />
    </>
  )
}

export default VisitsPage
