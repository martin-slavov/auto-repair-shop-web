import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import AdminInvoicesView from '@/components/invoices/AdminInvoicesView'
import InvoiceTable from '@/components/invoices/InvoiceTable'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { getInvoices } from '../api/invoices'
import { useAuth } from '../auth/useAuth'
import type { SortState } from '../types/api'
import type { Invoice, InvoiceSortField, PaidFilter } from '../types/invoice'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

type InvoiceFilters = {
  invoiceNumber: string
  licensePlate: string
  paid: PaidFilter
}

const initialFilters: InvoiceFilters = { invoiceNumber: '', licensePlate: '', paid: '' }
const initialSort: SortState<InvoiceSortField> = { field: 'issuedDate', direction: 'desc' }

const fetchInvoicePage: FetchPage<Invoice, InvoiceSortField, InvoiceFilters> = (
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
    },
    signal,
  )

function InvoicesPage() {
  useDocumentTitle('Invoices')
  const { user } = useAuth()
  if (user?.role === 'ADMIN') return <AdminInvoicesView />
  return <CustomerInvoicesView />
}

function CustomerInvoicesView() {
  const table = useDataTable({
    fetchPage: fetchInvoicePage,
    initialSort,
    initialFilters,
  })

  return (
    <>
      <h1>Invoices</h1>
      <p className="mt-2 mb-6 text-muted-foreground">Invoices for the work on your vehicles.</p>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_1fr_10rem_auto]"
          >
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
            <Button
              type="button"
              variant="outline"
              disabled={!table.hasActiveFilters}
              onClick={table.clearFilters}
            >
              Clear filters
            </Button>
          </form>

          <InvoiceTable
            rows={table.rows}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load invoices: ${table.error}`}
            emptyMessage={
              table.hasActiveFilters ? 'No invoices match your filters.' : 'No invoices yet.'
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

export default InvoicesPage
