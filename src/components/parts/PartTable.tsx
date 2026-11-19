import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ActiveBadge from '@/components/ActiveBadge'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import { formatMoney } from '../../lib/money'
import type { SortState } from '../../types/api'
import type { PartAdmin, PartAdminSortField } from '../../types/part'

interface PartTableProps {
  rows: PartAdmin[] | null
  sort: SortState<PartAdminSortField>
  onSortChange: (field: PartAdminSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  onEdit: (part: PartAdmin) => void
  onDelete: (part: PartAdmin) => void
}

function PartTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  onEdit,
  onDelete,
}: PartTableProps) {
  const columns: DataTableColumn<PartAdmin, PartAdminSortField>[] = [
    {
      id: 'name',
      header: 'Name',
      sortField: 'name',
      className: 'w-full min-w-40 whitespace-normal font-medium',
      cell: (part) => (
        <div title={part.name} className="line-clamp-2 wrap-anywhere">
          {part.name}
        </div>
      ),
    },
    {
      id: 'serialNumber',
      header: 'Serial number',
      sortField: 'serialNumber',
      className: 'min-w-32 whitespace-normal',
      cell: (part) => (
        <div title={part.serialNumber} className="line-clamp-2 wrap-anywhere">
          {part.serialNumber}
        </div>
      ),
    },
    {
      id: 'unitCost',
      header: 'Unit cost',
      sortField: 'unitCost',
      align: 'right',
      className: 'tabular-nums',
      cell: (part) => formatMoney(part.unitCost),
    },
    {
      id: 'unitSellPrice',
      header: 'Sell price',
      sortField: 'unitSellPrice',
      align: 'right',
      className: 'tabular-nums',
      cell: (part) => formatMoney(part.unitSellPrice),
    },
    {
      id: 'active',
      header: 'Status',
      cell: (part) => <ActiveBadge active={part.active} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      cell: (part) => (
        <div className="flex flex-nowrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(part)}>
            <Pencil aria-hidden="true" />
            Edit<span className="sr-only"> {part.name}</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(part)}>
            <Trash2 aria-hidden="true" />
            Delete<span className="sr-only"> {part.name}</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(part) => part.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  )
}

export default PartTable
