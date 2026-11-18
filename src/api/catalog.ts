import type { PageResponse } from '../types/api'
import type { CatalogItem, CatalogItemQuery } from '../types/catalog'
import { apiGet, buildQueryString } from './client'

export function getCatalogItems(
  query: CatalogItemQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<CatalogItem>> {
  return apiGet<PageResponse<CatalogItem>>('/api/catalog-items' + buildQueryString(query), signal)
}
