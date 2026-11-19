import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DataTableQuery, PageResponse, SortState } from '@/types/api'

const DEFAULT_DEBOUNCE_MS = 150

export type FilterValues = Record<string, string>

export type FetchPage<T, S extends string, F extends FilterValues> = (
  query: DataTableQuery<S, F>,
  signal: AbortSignal,
) => Promise<PageResponse<T>>

interface UseDataTableOptions<T, S extends string, F extends FilterValues> {
  fetchPage: FetchPage<T, S, F>
  initialSort: SortState<S>
  initialFilters: F
  initialPageSize?: number
  debounceMs?: number
}

interface FetchResult<T, S extends string, F extends FilterValues> {
  query: DataTableQuery<S, F> | null
  reloadKey: number
  data: PageResponse<T> | null
  error: string | null
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError'
}

export function useDataTable<T, S extends string, F extends FilterValues>({
  fetchPage,
  initialSort,
  initialFilters,
  initialPageSize = 10,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseDataTableOptions<T, S, F>) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [sort, setSort] = useState<SortState<S>>(initialSort)
  const [filters, setFilters] = useState<F>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<F>(initialFilters)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult<T, S, F>>({
    query: null,
    reloadKey: 0,
    data: null,
    error: null,
  })

  useEffect(() => {
    if (filters === appliedFilters) return
    const timer = setTimeout(() => {
      setAppliedFilters(filters)
      setPage(0)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [filters, appliedFilters, debounceMs])

  const query = useMemo<DataTableQuery<S, F>>(
    () => ({ page, size: pageSize, sort, filters: appliedFilters }),
    [page, pageSize, sort, appliedFilters],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchPage(query, controller.signal)
      .then((data) => setResult({ query, reloadKey, data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted || isAbortError(err)) return
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setResult((prev) => ({ query, reloadKey, data: prev.data, error: message }))
      })
    return () => controller.abort()
  }, [fetchPage, query, reloadKey])

  const loading = result.query !== query || result.reloadKey !== reloadKey

  const refresh = useCallback(() => {
    setReloadKey((prev) => prev + 1)
  }, [])

  function refreshAfterRowRemoved() {
    if (result.data?.content.length === 1 && page > 0) {
      setPage(page - 1)
    } else {
      refresh()
    }
  }

  function setPageSize(size: number) {
    setPageSizeState(size)
    setPage(0)
  }

  function toggleSort(field: S) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' },
    )
    setPage(0)
  }

  function setFilter<K extends keyof F>(key: K, value: F[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setPage(0)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value.trim() !== '')

  return {
    data: result.data,
    rows: result.data?.content ?? null,
    loading,
    error: loading ? null : result.error,
    page,
    pageSize,
    sort,
    filters,
    hasActiveFilters,
    setPage,
    setPageSize,
    toggleSort,
    setFilter,
    clearFilters,
    refresh,
    refreshAfterRowRemoved,
  }
}
