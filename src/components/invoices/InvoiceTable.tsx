import { Link } from 'react-router'
import { CircleCheck, Eye, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import { formatDateTime } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import type { SortState } from '../../types/api'
import type { Invoice, InvoiceSortField } from '../../types/invoice'
import InvoicePaidBadge from './InvoicePaidBadge'

type InvoiceColumn = DataTableColumn<Invoice, InvoiceSortField>

const numberColumn: InvoiceColumn = {
  id: 'invoiceNumber',
  header: 'Invoice number',
  sortField: 'invoiceNumber',
  className: 'font-medium tabular-nums',
  cell: (invoice) => invoice.invoiceNumber,
}

const issuedColumn: InvoiceColumn = {
  id: 'issuedDate',
  header: 'Issued',
  sortField: 'issuedDate',
  className: 'tabular-nums',
  cell: (invoice) => formatDateTime(invoice.issuedDate),
}

const licensePlateColumn: InvoiceColumn = {
  id: 'licensePlate',
  header: 'License plate',
  cell: (invoice) => invoice.licensePlate,
}

const partsColumn: InvoiceColumn = {
  id: 'partsPrice',
  header: 'Parts',
  align: 'right',
  className: 'tabular-nums',
  cell: (invoice) => formatMoney(invoice.partsPrice),
}

const laborColumn: InvoiceColumn = {
  id: 'laborPrice',
  header: 'Labour',
  align: 'right',
  className: 'tabular-nums',
  cell: (invoice) => formatMoney(invoice.laborPrice),
}

const totalColumn: InvoiceColumn = {
  id: 'totalPrice',
  header: 'Total',
  sortField: 'totalPrice',
  align: 'right',
  className: 'tabular-nums',
  cell: (invoice) => formatMoney(invoice.totalPrice),
}

const paidColumn: InvoiceColumn = {
  id: 'paid',
  header: 'Status',
  sortField: 'paid',
  cell: (invoice) => <InvoicePaidBadge paid={invoice.paid} />,
}

function ViewInvoiceLink({ invoice }: { invoice: Invoice }) {
  return (
    <Link
      to={`/invoices/${invoice.id}`}
      className={buttonVariants({ variant: 'outline', size: 'sm' })}
    >
      <Eye aria-hidden="true" />
      View<span className="sr-only"> invoice {invoice.invoiceNumber}</span>
    </Link>
  )
}

const customerColumns: InvoiceColumn[] = [
  numberColumn,
  issuedColumn,
  licensePlateColumn,
  totalColumn,
  paidColumn,
  {
    id: 'actions',
    header: 'Actions',
    align: 'right',
    cell: (invoice) => <ViewInvoiceLink invoice={invoice} />,
  },
]

interface AdminActions {
  onMarkPaid: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
}

function adminColumns({ onMarkPaid, onDelete }: AdminActions): InvoiceColumn[] {
  return [
    numberColumn,
    { ...issuedColumn, className: 'whitespace-normal tabular-nums' },
    licensePlateColumn,
    partsColumn,
    laborColumn,
    totalColumn,
    paidColumn,
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      cell: (invoice) => (
        <div className="flex flex-nowrap justify-end gap-2">
          <ViewInvoiceLink invoice={invoice} />
          {!invoice.paid && (
            <>
              <Button variant="outline" size="sm" onClick={() => onMarkPaid(invoice)}>
                <CircleCheck aria-hidden="true" />
                Mark as paid<span className="sr-only"> invoice {invoice.invoiceNumber}</span>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(invoice)}>
                <Trash2 aria-hidden="true" />
                Delete<span className="sr-only"> invoice {invoice.invoiceNumber}</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]
}

type InvoiceTableProps = {
  rows: Invoice[] | null
  sort: SortState<InvoiceSortField>
  onSortChange: (field: InvoiceSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
} & ({ audience?: 'customer' } | ({ audience: 'admin' } & AdminActions))

function InvoiceTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  ...rest
}: InvoiceTableProps) {
  const columns = rest.audience === 'admin' ? adminColumns(rest) : customerColumns

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(invoice) => invoice.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  )
}

export default InvoiceTable
