import type { PageResponse } from '../types/api'
import type { Invoice } from '../types/invoice'
import type { ServiceVisit, ServiceVisitQuery, ServiceVisitUpdate } from '../types/serviceVisit'
import { apiDelete, apiGet, apiPatch, apiPut, buildQueryString } from './client'

export function getServiceVisits(
  query: ServiceVisitQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<ServiceVisit>> {
  return apiGet<PageResponse<ServiceVisit>>('/api/service-visits' + buildQueryString(query), signal)
}

export function updateServiceVisit(id: number, body: ServiceVisitUpdate): Promise<ServiceVisit> {
  return apiPut<ServiceVisit>(`/api/service-visits/${id}`, body)
}

export function deleteServiceVisit(id: number): Promise<void> {
  return apiDelete(`/api/service-visits/${id}`)
}

export function invoiceServiceVisit(id: number): Promise<Invoice> {
  return apiPatch<Invoice>(`/api/service-visits/${id}/invoice`)
}
