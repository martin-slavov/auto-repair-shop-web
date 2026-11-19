import type { PageResponse } from '../types/api'
import type {
  CatalogItem,
  CatalogItemCreate,
  CatalogItemQuery,
  CatalogItemUpdate,
} from '../types/catalog'
import { apiDelete, apiGet, apiPost, apiPut, buildQueryString } from './client'

export function getCatalogItems(
  query: CatalogItemQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<CatalogItem>> {
  return apiGet<PageResponse<CatalogItem>>('/api/catalog-items' + buildQueryString(query), signal)
}

export function createCatalogItem(body: CatalogItemCreate): Promise<CatalogItem> {
  return apiPost<CatalogItem>('/api/catalog-items', body)
}

export function updateCatalogItem(id: number, body: CatalogItemUpdate): Promise<CatalogItem> {
  return apiPut<CatalogItem>(`/api/catalog-items/${id}`, body)
}

export function deleteCatalogItem(id: number): Promise<void> {
  return apiDelete(`/api/catalog-items/${id}`)
}
