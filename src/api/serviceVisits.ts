import type { PageResponse } from '../types/api'
import type { ServiceVisit, ServiceVisitQuery } from '../types/serviceVisit'
import { apiGet, buildQueryString } from './client'

export function getServiceVisits(
  query: ServiceVisitQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<ServiceVisit>> {
  return apiGet<PageResponse<ServiceVisit>>('/api/service-visits' + buildQueryString(query), signal)
}
