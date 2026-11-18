export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ErrorResponse {
  status: number
  message: string
  timestamp: string
  fieldErrors?: Record<string, string>
}

export type SortDirection = 'asc' | 'desc'

export interface SortState<S extends string = string> {
  field: S
  direction: SortDirection
}

export type SortParam<S extends string> = `${S},${SortDirection}`

export type PageQuery<S extends string = string> = {
  page?: number
  size?: number
  sort?: SortParam<S>
}

export interface DataTableQuery<S extends string, F> {
  page: number
  size: number
  sort: SortState<S>
  filters: F
}
