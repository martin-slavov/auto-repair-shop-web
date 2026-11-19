import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import ConfirmActionDialog from '@/components/ConfirmActionDialog'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { useMechanics } from '@/hooks/useMechanics'
import { isDateRangeInvalid, useRangeFilter } from '@/hooks/useRangeFilter'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { deleteServiceVisit, getServiceVisits, invoiceServiceVisit } from '../../api/serviceVisits'
import type { SortState } from '../../types/api'
import type { Invoice } from '../../types/invoice'
import {
  SERVICE_VISIT_STATUS_LABELS,
  SERVICE_VISIT_STATUS_ORDER,
  type ServiceVisit,
  type ServiceVisitSortField,
  type ServiceVisitStatus,
} from '../../types/serviceVisit'
import RescheduleVisitDialog from './RescheduleVisitDialog'
import VisitDetailsDialog from './VisitDetailsDialog'
import VisitTable from './VisitTable'

const SUCCESS_MESSAGE_MS = 4000
const DATE_RANGE_ERROR_ID = 'visits-date-range-error'

type AdminVisitFilters = {
  licensePlate: string
  status: ServiceVisitStatus | ''
  mechanicId: string
  scheduledFrom: string
  scheduledTo: string
}

const initialFilters: AdminVisitFilters = {
  licensePlate: '',
  status: '',
  mechanicId: '',
  scheduledFrom: '',
  scheduledTo: '',
}
const initialSort: SortState<ServiceVisitSortField> = { field: 'scheduledDate', direction: 'desc' }

const fetchAdminVisitPage: FetchPage<ServiceVisit, ServiceVisitSortField, AdminVisitFilters> = (
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
      mechanicId: filters.mechanicId ? Number(filters.mechanicId) : '',
      scheduledFrom: filters.scheduledFrom,
      scheduledTo: filters.scheduledTo,
    },
    signal,
  )

function AdminVisitsView() {
  const table = useDataTable({
    fetchPage: fetchAdminVisitPage,
    initialSort,
    initialFilters,
  })
  const { mechanics, error: mechanicsError } = useMechanics(true, { onlyEnabled: false })

  const dateRange = useRangeFilter(isDateRangeInvalid, ({ from, to }) => {
    table.setFilter('scheduledFrom', from)
    table.setFilter('scheduledTo', to)
  })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsVisit, setDetailsVisit] = useState<ServiceVisit | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleVisit, setRescheduleVisit] = useState<ServiceVisit | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceVisit | null>(null)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [invoiceTarget, setInvoiceTarget] = useState<ServiceVisit | null>(null)
  const createdInvoice = useRef<Invoice | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [success])

  const dateRangeInvalid = dateRange.invalid
  const canClearFilters = table.hasActiveFilters || !dateRange.isEmpty

  function clearFilters() {
    dateRange.clear()
    table.clearFilters()
  }

  function openDetails(visit: ServiceVisit) {
    setDetailsVisit(visit)
    setDetailsOpen(true)
  }

  function openReschedule(visit: ServiceVisit) {
    setRescheduleVisit(visit)
    setRescheduleOpen(true)
  }

  function openDelete(visit: ServiceVisit) {
    setDeleteTarget(visit)
    setDeleteOpen(true)
  }

  function openInvoice(visit: ServiceVisit) {
    setInvoiceTarget(visit)
    setInvoiceOpen(true)
  }

  function handleRescheduled(visit: ServiceVisit) {
    setRescheduleOpen(false)
    setSuccess(`Visit for ${visit.licensePlate} was rescheduled.`)
    table.refresh()
  }

  function handleDeleted(visit: ServiceVisit) {
    setDeleteOpen(false)
    setSuccess(`Visit for ${visit.licensePlate} was deleted.`)
    table.refreshAfterRowRemoved()
  }

  function handleInvoiced(visit: ServiceVisit) {
    setInvoiceOpen(false)
    const invoice = createdInvoice.current
    setSuccess(
      invoice
        ? `Invoice ${invoice.invoiceNumber} was created for ${visit.licensePlate}.`
        : `Invoice was created for ${visit.licensePlate}.`,
    )
    if (table.filters.status !== '') {
      table.refreshAfterRowRemoved()
    } else {
      table.refresh()
    }
  }

  return (
    <>
      <h1>Visits</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        All service visits, from scheduling to invoice.
      </p>

      {success && (
        <p
          role="status"
          className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-text"
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
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="visits-license-plate">License plate</Label>
                <Input
                  id="visits-license-plate"
                  maxLength={8}
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="visits-mechanic">Mechanic</Label>
                <select
                  id="visits-mechanic"
                  value={table.filters.mechanicId}
                  disabled={mechanics === null}
                  title={mechanicsError ? `Could not load mechanics: ${mechanicsError}` : undefined}
                  onChange={(event) => table.setFilter('mechanicId', event.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">All</option>
                  {mechanics?.map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.firstName} {mechanic.lastName}
                      {mechanic.enabled ? '' : ' (disabled)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="visits-scheduled-from">Scheduled from</Label>
                <Input
                  id="visits-scheduled-from"
                  type="date"
                  value={dateRange.range.from}
                  onChange={(event) => dateRange.change('from', event.target.value)}
                  aria-invalid={dateRangeInvalid}
                  aria-describedby={dateRangeInvalid ? DATE_RANGE_ERROR_ID : undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="visits-scheduled-to">Scheduled to</Label>
                <Input
                  id="visits-scheduled-to"
                  type="date"
                  value={dateRange.range.to}
                  onChange={(event) => dateRange.change('to', event.target.value)}
                  aria-invalid={dateRangeInvalid}
                  aria-describedby={dateRangeInvalid ? DATE_RANGE_ERROR_ID : undefined}
                />
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

            {dateRangeInvalid && (
              <p id={DATE_RANGE_ERROR_ID} role="alert" className="text-sm text-destructive">
                Start date must not be after end date
              </p>
            )}
          </form>

          <VisitTable
            rows={table.rows}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load visits: ${table.error}`}
            emptyMessage={
              table.hasActiveFilters ? 'No visits match your filters.' : 'No visits yet.'
            }
            onDetails={openDetails}
            onReschedule={openReschedule}
            onDelete={openDelete}
            onInvoice={openInvoice}
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
        audience="admin"
      />

      <RescheduleVisitDialog
        open={rescheduleOpen}
        visit={rescheduleVisit}
        onOpenChange={setRescheduleOpen}
        onSaved={handleRescheduled}
        onRefreshNeeded={table.refresh}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete visit?"
        description={
          deleteTarget &&
          `The scheduled visit for ${deleteTarget.licensePlate} will be deleted and its service request will go back to Pending. This cannot be undone.`
        }
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (deleteTarget) await deleteServiceVisit(deleteTarget.id)
        }}
        onDeleted={() => {
          if (deleteTarget) handleDeleted(deleteTarget)
        }}
        onRefreshNeeded={table.refresh}
      />

      <ConfirmActionDialog
        open={invoiceOpen}
        title="Create invoice?"
        description={
          invoiceTarget &&
          `An invoice will be created for the visit for ${invoiceTarget.licensePlate} and the visit will move to ${SERVICE_VISIT_STATUS_LABELS.INVOICED}.`
        }
        confirmLabel="Create invoice"
        pendingLabel="Creating…"
        onOpenChange={setInvoiceOpen}
        onConfirm={async () => {
          createdInvoice.current = null
          if (invoiceTarget) createdInvoice.current = await invoiceServiceVisit(invoiceTarget.id)
        }}
        onDone={() => {
          if (invoiceTarget) handleInvoiced(invoiceTarget)
        }}
        onRefreshNeeded={table.refresh}
      />
    </>
  )
}

export default AdminVisitsView
