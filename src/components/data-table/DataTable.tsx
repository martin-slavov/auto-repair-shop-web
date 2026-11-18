import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SortState } from '@/types/api'

export interface DataTableColumn<T, S extends string = string> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  sortField?: S
  align?: 'left' | 'right'
  className?: string
}

interface DataTableProps<T, S extends string> {
  columns: DataTableColumn<T, S>[]
  rows: T[] | null
  getRowKey: (row: T) => string | number
  sort?: SortState<S>
  onSortChange?: (field: S) => void
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  skeletonRows?: number
}

function SortIcon({ active, direction }: { active: boolean; direction?: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="opacity-40" aria-hidden="true" />
  return direction === 'asc' ? (
    <ArrowUp aria-hidden="true" />
  ) : (
    <ArrowDown aria-hidden="true" />
  )
}

function DataTable<T, S extends string>({
  columns,
  rows,
  getRowKey,
  sort,
  onSortChange,
  loading = false,
  error = null,
  emptyMessage = 'No results found.',
  skeletonRows = 5,
}: DataTableProps<T, S>) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {error}
      </p>
    )
  }

  let body: ReactNode
  if (rows === null) {
    body = Array.from({ length: skeletonRows }, (_, index) => (
      <TableRow key={index} aria-hidden="true" className="hover:bg-transparent">
        <TableCell colSpan={columns.length}>
          <div className="h-6 animate-pulse rounded bg-muted" />
        </TableCell>
      </TableRow>
    ))
  } else if (rows.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </TableCell>
      </TableRow>
    )
  } else {
    body = rows.map((row) => (
      <TableRow key={getRowKey(row)}>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            className={cn(column.align === 'right' && 'text-right', column.className)}
          >
            {column.cell(row)}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <div
      aria-busy={loading}
      className={cn('transition-opacity', loading && rows !== null && 'opacity-60')}
    >
      {loading && <p className="sr-only">Loading…</p>}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => {
              const alignRight = column.align === 'right'
              if (!column.sortField || !onSortChange) {
                return (
                  <TableHead key={column.id} className={cn(alignRight && 'text-right')}>
                    {column.header}
                  </TableHead>
                )
              }
              const sortField = column.sortField
              const active = sort?.field === sortField
              const ariaSort = active
                ? sort?.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
              return (
                <TableHead
                  key={column.id}
                  aria-sort={ariaSort}
                  className={cn(alignRight && 'text-right')}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={alignRight ? '-mr-2.5' : '-ml-2.5'}
                    onClick={() => onSortChange(sortField)}
                  >
                    {column.header}
                    <SortIcon active={active} direction={sort?.direction} />
                  </Button>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>{body}</TableBody>
      </Table>
    </div>
  )
}

export default DataTable
