// Shapes shared by many endpoints (see api-reference.md, sections 2.1 and 3.1).

// Every list endpoint returns one page of results wrapped in this object.
export interface PageResponse<T> {
  content: T[]
  page: number // 0-based
  size: number
  totalElements: number
  totalPages: number
}

// Body the API sends back when a request fails.
export interface ErrorResponse {
  status: number
  message: string
  timestamp: string
  // Optional: errors from the security filter (401/403) don't include it.
  fieldErrors?: Record<string, string>
}
