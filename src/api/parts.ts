import type { PageResponse } from '../types/api'
import type {
  PartAdmin,
  PartAdminQuery,
  PartCatalog,
  PartCreate,
  PartQuery,
  PartUpdate,
} from '../types/part'
import { apiDelete, apiGet, apiPost, apiPut, buildQueryString } from './client'

export function getParts(
  query: PartQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<PartCatalog>> {
  return apiGet<PageResponse<PartCatalog>>('/api/parts' + buildQueryString(query), signal)
}

export function getAdminParts(
  query: PartAdminQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<PartAdmin>> {
  return apiGet<PageResponse<PartAdmin>>('/api/parts' + buildQueryString(query), signal)
}

export function createPart(body: PartCreate): Promise<PartAdmin> {
  return apiPost<PartAdmin>('/api/parts', body)
}

export function updatePart(id: number, body: PartUpdate): Promise<PartAdmin> {
  return apiPut<PartAdmin>(`/api/parts/${id}`, body)
}

export function deletePart(id: number): Promise<void> {
  return apiDelete(`/api/parts/${id}`)
}
