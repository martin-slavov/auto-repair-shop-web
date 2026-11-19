import type { PageResponse } from '../types/api'
import type { Invoice } from '../types/invoice'
import type {
  CompleteVisitBody,
  ServiceVisit,
  ServiceVisitQuery,
  ServiceVisitUpdate,
  VisitPart,
  VisitPartCreate,
  VisitPartUpdate,
} from '../types/serviceVisit'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, buildQueryString } from './client'

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

export function startServiceVisit(id: number): Promise<ServiceVisit> {
  return apiPatch<ServiceVisit>(`/api/service-visits/${id}/status`, { newStatus: 'IN_PROGRESS' })
}

export function completeServiceVisit(id: number, body: CompleteVisitBody): Promise<ServiceVisit> {
  return apiPatch<ServiceVisit>(`/api/service-visits/${id}/complete`, body)
}

export function getVisitParts(visitId: number, signal?: AbortSignal): Promise<VisitPart[]> {
  return apiGet<VisitPart[]>(`/api/service-visits/${visitId}/parts`, signal)
}

export function addVisitPart(visitId: number, body: VisitPartCreate): Promise<VisitPart> {
  return apiPost<VisitPart>(`/api/service-visits/${visitId}/parts`, body)
}

export function updateVisitPart(
  visitId: number,
  partLineId: number,
  body: VisitPartUpdate,
): Promise<VisitPart> {
  return apiPut<VisitPart>(`/api/service-visits/${visitId}/parts/${partLineId}`, body)
}

export function deleteVisitPart(visitId: number, partLineId: number): Promise<void> {
  return apiDelete(`/api/service-visits/${visitId}/parts/${partLineId}`)
}
