import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import ConfirmActionDialog from '@/components/ConfirmActionDialog'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { isDateRangeInvalid, isNumberRangeInvalid, useRangeFilter } from '@/hooks/useRangeFilter'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { ApiError } from '../../api/client'
import { deleteInvoice, getInvoices, payInvoice } from '../../api/invoices'
import { formatMoney } from '../../lib/money'
import type { SortState } from '../../types/api'
import type { Invoice, InvoiceSortField, PaidFilter } from '../../types/invoice'
import InvoiceTable from './InvoiceTable'

const SUCCESS_MESSAGE_MS = 4000
const DATE_RANGE_ERROR_ID = 'invoices-date-range-error'
const TOTAL_RANGE_ERROR_ID = 'invoices-total-range-error'

type AdminInvoiceFilters = {
  invoiceNumber: string
  licensePlate: string
  paid: PaidFilter
  issuedFrom: string
  issuedTo: string
  minTotal: string
  maxTotal: string
}

const initialFilters: AdminInvoiceFilters = {
  invoiceNumber: '',
  licensePlate: '',
  paid: '',
  issuedFrom: '',
  issuedTo: '',
  minTotal: '',
  maxTotal: '',
}
const initialSort: SortState<InvoiceSortField> = { field: 'issuedDate', direction: 'desc' }

const fetchAdminInvoicePage: FetchPage<Invoice, InvoiceSortField, AdminInvoiceFilters> = (
  { page, size, sort, filters },
  signal,
) =>
  getInvoices(
    {
      page,
      size,
      sort: `${sort.field},${sort.direction}`,
      invoiceNumber: filters.invoiceNumber,
      licensePlate: filters.licensePlate,
      paid: filters.paid,
      issuedFrom: filters.issuedFrom,
      issuedTo: filters.issuedTo,
      minTotal: filters.minTotal,
      maxTotal: filters.maxTotal,
    },
    signal,
  )

function AdminInvoicesView() {
  const table = useDataTable({
    fetchPage: fetchAdminInvoicePage,
    initialSort,
    initialFilters,
  })
  const dateRange = useRangeFilter(isDateRangeInvalid, ({ from, to }) => {
    table.setFilter('issuedFrom', from)
    table.setFilter('issuedTo', to)
  })
  const totalRange = useRangeFilter(isNumberRangeInvalid, ({ from, to }) => {
    table.setFilter('minTotal', from)
    table.setFilter('maxTotal', to)
  })

  const [payOpen, setPayOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<Invoice | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [success])

  const canClearFilters = table.hasActiveFilters || !dateRange.isEmpty || !totalRange.isEmpty

  function clearFilters() {
    dateRange.clear()
    totalRange.clear()
    table.clearFilters()
  }

  function openPay(invoice: Invoice) {
    setPayTarget(invoice)
    setPayOpen(true)
  }

  function openDelete(invoice: Invoice) {
    setDeleteTarget(invoice)
    setDeleteOpen(true)
  }

  async function runAndRefreshOnConflict(action: () => Promise<unknown>) {
    try {
      await action()
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status !== 404) table.refresh()
      throw err
    }
  }

  function handlePaid(invoice: Invoice) {
    setPayOpen(false)
    setSuccess(`Invoice ${invoice.invoiceNumber} was marked as paid.`)
    if (table.filters.paid !== '') {
      table.refreshAfterRowRemoved()
    } else {
      table.refresh()
    }
  }

  function handleDeleted(invoice: Invoice) {
    setDeleteOpen(false)
    setSuccess(`Invoice ${invoice.invoiceNumber} was deleted.`)
    table.refreshAfterRowRemoved()
  }

  return (
    <>
      <h1>Invoices</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        All invoices. Mark an invoice as paid once the customer has paid it.
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
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_1fr_10rem]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoices-number">Invoice number</Label>
                <Input
                  id="invoices-number"
                  maxLength={20}
                  type="search"
                  placeholder="e.g. INV-2026"
                  value={table.filters.invoiceNumber}
                  onChange={(event) => table.setFilter('invoiceNumber', event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoices-license-plate">License plate</Label>
                <Input
                  id="invoices-license-plate"
                  maxLength={8}
                  type="search"
                  placeholder="e.g. CA1234"
                  value={table.filters.licensePlate}
                  onChange={(event) => table.setFilter('licensePlate', event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoices-paid">Status</Label>
                <select
                  id="invoices-paid"
                  value={table.filters.paid}
                  onChange={(event) => table.setFilter('paid', event.target.value as PaidFilter)}
                  className={SELECT_CLASS}
                >
                  <option value="">All</option>
                  <option value="false">Unpaid</option>
                  <option value="true">Paid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoices-issued-from">Issued from</Label>
                <Input
                  id="invoices-issued-from"
                  type="date"
                  value={dateRange.range.from}
                  onChange={(event) => dateRange.change('from', event.target.value)}
                  aria-invalid={dateRange.invalid}
                  aria-describedby={dateRange.invalid ? DATE_RANGE_ERROR_ID : undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoices-issued-to">Issued to</Label>
                <Input
                  id="invoices-issued-to"
                  type="date"
                  value={dateRange.range.to}
                  onChange={(event) => dateRange.change('to', event.target.value)}
                  aria-invalid={dateRange.invalid}
                  aria-describedby={dateRange.invalid ? DATE_RANGE_ERROR_ID : undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoices-min-total">Min total</Label>
                <Input
                  id="invoices-min-total"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={totalRange.range.from}
                  onChange={(event) => totalRange.change('from', event.target.value)}
                  aria-invalid={totalRange.invalid}
                  aria-describedby={totalRange.invalid ? TOTAL_RANGE_ERROR_ID : undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoices-max-total">Max total</Label>
                <Input
                  id="invoices-max-total"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={totalRange.range.to}
                  onChange={(event) => totalRange.change('to', event.target.value)}
                  aria-invalid={totalRange.invalid}
                  aria-describedby={totalRange.invalid ? TOTAL_RANGE_ERROR_ID : undefined}
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

            {dateRange.invalid && (
              <p id={DATE_RANGE_ERROR_ID} role="alert" className="text-sm text-destructive">
                Start date must not be after end date
              </p>
            )}
            {totalRange.invalid && (
              <p id={TOTAL_RANGE_ERROR_ID} role="alert" className="text-sm text-destructive">
                Min total must not be more than max total
              </p>
            )}
          </form>

          <InvoiceTable
            audience="admin"
            rows={table.rows}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load invoices: ${table.error}`}
            emptyMessage={
              table.hasActiveFilters ? 'No invoices match your filters.' : 'No invoices yet.'
            }
            onMarkPaid={openPay}
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

      <ConfirmActionDialog
        open={payOpen}
        title="Mark invoice as paid?"
        description={
          payTarget &&
          `Invoice ${payTarget.invoiceNumber} (${payTarget.licensePlate}, total ${formatMoney(payTarget.totalPrice)}) will be marked as paid. This cannot be undone: a paid invoice cannot be deleted or marked unpaid.`
        }
        confirmLabel="Mark as paid"
        pendingLabel="Saving…"
        onOpenChange={setPayOpen}
        onConfirm={() =>
          runAndRefreshOnConflict(async () => {
            if (payTarget) await payInvoice(payTarget.id)
          })
        }
        onDone={() => {
          if (payTarget) handlePaid(payTarget)
        }}
        onRefreshNeeded={table.refresh}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete invoice?"
        description={
          deleteTarget &&
          `Invoice ${deleteTarget.invoiceNumber} (${deleteTarget.licensePlate}) will be deleted permanently. Its visit goes back to Completed, so a new invoice can be created from it.`
        }
        onOpenChange={setDeleteOpen}
        onConfirm={() =>
          runAndRefreshOnConflict(async () => {
            if (deleteTarget) await deleteInvoice(deleteTarget.id)
          })
        }
        onDeleted={() => {
          if (deleteTarget) handleDeleted(deleteTarget)
        }}
        onRefreshNeeded={table.refresh}
      />
    </>
  )
}

export default AdminInvoicesView
