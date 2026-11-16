import type { PageResponse } from '../types/api'
import type { CatalogItem } from '../types/catalog'
import { apiGet } from './client'

export function getCatalogItems(): Promise<PageResponse<CatalogItem>> {
  return apiGet<PageResponse<CatalogItem>>('/api/catalog-items')
}
