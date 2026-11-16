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
