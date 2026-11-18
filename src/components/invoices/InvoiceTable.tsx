import { Link } from 'react-router'
import { Eye } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import { formatDateTime } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import type { SortState } from '../../types/api'
import type { Invoice, InvoiceSortField } from '../../types/invoice'
import InvoicePaidBadge from './InvoicePaidBadge'

const columns: DataTableColumn<Invoice, InvoiceSortField>[] = [
  {
    id: 'invoiceNumber',
    header: 'Invoice number',
    sortField: 'invoiceNumber',
    className: 'font-medium tabular-nums',
    cell: (invoice) => invoice.invoiceNumber,
  },
  {
    id: 'issuedDate',
    header: 'Issued',
    sortField: 'issuedDate',
    className: 'tabular-nums',
    cell: (invoice) => formatDateTime(invoice.issuedDate),
  },
  {
    id: 'licensePlate',
    header: 'License plate',
    cell: (invoice) => invoice.licensePlate,
  },
  {
    id: 'totalPrice',
    header: 'Total',
    sortField: 'totalPrice',
    align: 'right',
    className: 'tabular-nums',
    cell: (invoice) => formatMoney(invoice.totalPrice),
  },
  {
    id: 'paid',
    header: 'Status',
    sortField: 'paid',
    cell: (invoice) => <InvoicePaidBadge paid={invoice.paid} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    align: 'right',
    cell: (invoice) => (
      <Link
        to={`/invoices/${invoice.id}`}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        <Eye aria-hidden="true" />
        View<span className="sr-only"> invoice {invoice.invoiceNumber}</span>
      </Link>
    ),
  },
]

interface InvoiceTableProps {
  rows: Invoice[] | null
  sort: SortState<InvoiceSortField>
  onSortChange: (field: InvoiceSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
}

function InvoiceTable({ rows, sort, onSortChange, loading, error, emptyMessage }: InvoiceTableProps) {
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
