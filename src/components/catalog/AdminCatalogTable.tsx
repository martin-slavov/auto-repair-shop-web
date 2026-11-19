import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ActiveBadge from '@/components/ActiveBadge'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import { formatMoney } from '../../lib/money'
import type { SortState } from '../../types/api'
import type { CatalogItem, CatalogSortField } from '../../types/catalog'

interface AdminCatalogTableProps {
  rows: CatalogItem[] | null
  sort: SortState<CatalogSortField>
  onSortChange: (field: CatalogSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  onEdit: (item: CatalogItem) => void
  onDelete: (item: CatalogItem) => void
}

function AdminCatalogTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  onEdit,
  onDelete,
}: AdminCatalogTableProps) {
  const columns: DataTableColumn<CatalogItem, CatalogSortField>[] = [
    {
      id: 'name',
      header: 'Name',
      sortField: 'name',
      className: 'min-w-32 whitespace-normal font-medium',
      cell: (item) => (
        <div title={item.name} className="line-clamp-2 wrap-anywhere">
          {item.name}
        </div>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      className: 'w-full min-w-40 whitespace-normal',
      cell: (item) => (
        <div title={item.description} className="line-clamp-2 wrap-anywhere">
          {item.description}
        </div>
      ),
    },
    {
      id: 'price',
      header: 'Base price',
      sortField: 'price',
      align: 'right',
      className: 'tabular-nums',
      cell: (item) => formatMoney(item.basePrice),
    },
    {
      id: 'estimatedHours',
      header: 'Est. hours',
      sortField: 'estimatedHours',
      align: 'right',
      className: 'tabular-nums',
      cell: (item) => item.estimatedHours.toFixed(2),
    },
    {
      id: 'active',
      header: 'Status',
      cell: (item) => <ActiveBadge active={item.active} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      cell: (item) => (
        <div className="flex flex-nowrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Pencil aria-hidden="true" />
            Edit<span className="sr-only"> {item.name}</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
            <Trash2 aria-hidden="true" />
            Delete<span className="sr-only"> {item.name}</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(item) => item.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  )
}

export default AdminCatalogTable
