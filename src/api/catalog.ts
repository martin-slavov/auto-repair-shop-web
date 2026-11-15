import type { PageResponse } from '../types/api'
import type { CatalogItem } from '../types/catalog'
import { apiGet } from './client'

// Public endpoint. Without query parameters the API returns page 0,
// 10 items, sorted by name.
export function getCatalogItems(): Promise<PageResponse<CatalogItem>> {
  return apiGet<PageResponse<CatalogItem>>('/api/catalog-items')
}
