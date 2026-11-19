import type { PageResponse } from '../types/api'
import type { PartCatalog, PartQuery } from '../types/part'
import { apiGet, buildQueryString } from './client'

export function getParts(
  query: PartQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<PartCatalog>> {
  return apiGet<PageResponse<PartCatalog>>('/api/parts' + buildQueryString(query), signal)
}
