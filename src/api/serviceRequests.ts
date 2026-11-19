import type { PageResponse } from '../types/api'
import type {
  ServiceRequest,
  ServiceRequestApprove,
  ServiceRequestCreate,
  ServiceRequestQuery,
  ServiceRequestUpdate,
} from '../types/serviceRequest'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, buildQueryString } from './client'

export function getServiceRequests(
  query: ServiceRequestQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<ServiceRequest>> {
  return apiGet<PageResponse<ServiceRequest>>(
    '/api/service-requests' + buildQueryString(query),
    signal,
  )
}

export function createServiceRequest(body: ServiceRequestCreate): Promise<ServiceRequest> {
  return apiPost<ServiceRequest>('/api/service-requests', body)
}

export function updateServiceRequest(
  id: number,
  body: ServiceRequestUpdate,
): Promise<ServiceRequest> {
  return apiPut<ServiceRequest>(`/api/service-requests/${id}`, body)
}

export function deleteServiceRequest(id: number): Promise<void> {
  return apiDelete(`/api/service-requests/${id}`)
}

export function approveServiceRequest(
  id: number,
  body: ServiceRequestApprove,
): Promise<ServiceRequest> {
  return apiPatch<ServiceRequest>(`/api/service-requests/${id}/approve`, body)
}

export function rejectServiceRequest(id: number): Promise<ServiceRequest> {
  return apiPatch<ServiceRequest>(`/api/service-requests/${id}/reject`)
}
