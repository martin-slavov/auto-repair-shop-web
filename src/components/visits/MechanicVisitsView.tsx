import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import ConfirmActionDialog from '@/components/ConfirmActionDialog'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { getServiceVisits, startServiceVisit } from '../../api/serviceVisits'
import type { SortState } from '../../types/api'
import {
  SERVICE_VISIT_STATUS_LABELS,
  SERVICE_VISIT_STATUS_ORDER,
  type ServiceVisit,
  type ServiceVisitSortField,
  type ServiceVisitStatus,
} from '../../types/serviceVisit'
import CompleteVisitDialog from './CompleteVisitDialog'
import MechanicVisitTable from './MechanicVisitTable'
import VisitDetailsDialog from './VisitDetailsDialog'
import VisitPartsDialog from './VisitPartsDialog'

const SUCCESS_MESSAGE_MS = 4000

type MechanicVisitFilters = {
  licensePlate: string
  status: ServiceVisitStatus | ''
}

const initialFilters: MechanicVisitFilters = { licensePlate: '', status: '' }
const initialSort: SortState<ServiceVisitSortField> = { field: 'scheduledDate', direction: 'desc' }

const fetchMechanicVisitPage: FetchPage<
  ServiceVisit,
  ServiceVisitSortField,
  MechanicVisitFilters
> = ({ page, size, sort, filters }, signal) =>
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

function MechanicVisitsView() {
  const table = useDataTable({
    fetchPage: fetchMechanicVisitPage,
    initialSort,
    initialFilters,
  })

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsVisit, setDetailsVisit] = useState<ServiceVisit | null>(null)
  const [startOpen, setStartOpen] = useState(false)
  const [startTarget, setStartTarget] = useState<ServiceVisit | null>(null)
  const [partsOpen, setPartsOpen] = useState(false)
  const [partsVisit, setPartsVisit] = useState<ServiceVisit | null>(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeVisit, setCompleteVisit] = useState<ServiceVisit | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [success])

  function openDetails(visit: ServiceVisit) {
    setDetailsVisit(visit)
    setDetailsOpen(true)
  }

  function openStart(visit: ServiceVisit) {
    setStartTarget(visit)
    setStartOpen(true)
  }

  function openParts(visit: ServiceVisit) {
    setPartsVisit(visit)
    setPartsOpen(true)
  }

  function openComplete(visit: ServiceVisit) {
    setCompleteVisit(visit)
    setCompleteOpen(true)
  }

  function refreshAfterStatusChange() {
    if (table.filters.status !== '') {
      table.refreshAfterRowRemoved()
    } else {
      table.refresh()
    }
  }

  function handleStarted(visit: ServiceVisit) {
    setStartOpen(false)
    setSuccess(`Visit for ${visit.licensePlate} was started.`)
    refreshAfterStatusChange()
  }

  function handleCompleted(visit: ServiceVisit) {
    setCompleteOpen(false)
    setSuccess(`Visit for ${visit.licensePlate} was completed.`)
    refreshAfterStatusChange()
  }

  return (
    <>
      <h1>Visits</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Visits you are assigned to. Start the work, record parts and complete the visit.
      </p>

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

          <MechanicVisitTable
            rows={table.rows}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load visits: ${table.error}`}
            emptyMessage={
              table.hasActiveFilters
                ? 'No visits match your filters.'
                : 'You are not assigned to any visits yet.'
            }
            onDetails={openDetails}
            onStart={openStart}
            onParts={openParts}
            onComplete={openComplete}
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

      <VisitDetailsDialog
        open={detailsOpen}
        visit={detailsVisit}
        onOpenChange={setDetailsOpen}
        audience="mechanic"
      />

      <ConfirmActionDialog
        open={startOpen}
        title="Start visit?"
        description={
          startTarget &&
          `The visit for ${startTarget.licensePlate} will move to ${SERVICE_VISIT_STATUS_LABELS.IN_PROGRESS}. This cannot be undone.`
        }
        confirmLabel="Start visit"
        pendingLabel="Starting…"
        onOpenChange={setStartOpen}
        onConfirm={async () => {
          if (startTarget) await startServiceVisit(startTarget.id)
        }}
        onDone={() => {
          if (startTarget) handleStarted(startTarget)
        }}
        onRefreshNeeded={table.refresh}
      />

      <VisitPartsDialog
        open={partsOpen}
        visit={partsVisit}
        onOpenChange={setPartsOpen}
        onChanged={table.refresh}
      />

      <CompleteVisitDialog
        open={completeOpen}
        visit={completeVisit}
        onOpenChange={setCompleteOpen}
        onCompleted={handleCompleted}
        onRefreshNeeded={table.refresh}
      />
    </>
  )
}

export default MechanicVisitsView
