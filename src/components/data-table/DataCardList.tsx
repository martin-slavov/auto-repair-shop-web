import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DataCardListProps<T> {
  rows: T[] | null
  getRowKey: (row: T) => string | number
  renderItem: (row: T) => ReactNode
  className: string
  loading?: boolean
  error?: string | null
  emptyState: ReactNode
  skeletonCount?: number
  skeletonClassName?: string
}

function DataCardList<T>({
  rows,
  getRowKey,
  renderItem,
  className,
  loading = false,
  error = null,
  emptyState,
  skeletonCount = 6,
  skeletonClassName = 'h-44',
}: DataCardListProps<T>) {
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

  if (rows === null) {
    return (
      <div aria-busy="true" className={className}>
        <p className="sr-only">Loading…</p>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className={cn('animate-pulse rounded-xl bg-muted', skeletonClassName)}
          />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center text-muted-foreground">
        {emptyState}
      </div>
    )
  }

  return (
    <div aria-busy={loading} className={cn('transition-opacity', loading && 'opacity-60')}>
      {loading && <p className="sr-only">Loading…</p>}
      <div className={className}>
        {rows.map((row) => (
          <Fragment key={getRowKey(row)}>{renderItem(row)}</Fragment>
        ))}
      </div>
    </div>
  )
}

export default DataCardList
