import type { PageQuery } from './api'

// CatalogItemResponseDTO
export interface CatalogItem {
  id: number
  name: string
  description: string
  basePrice: number
  active: boolean
  createdAt: string
  estimatedHours: number
}

export type CatalogSortField = 'name' | 'price' | 'estimatedHours' | 'createdAt'

export type CatalogItemQuery = PageQuery<CatalogSortField> & {
  name?: string
  minPrice?: string | number
  maxPrice?: string | number
  active?: boolean
}

// CatalogItemCreateDTO
export interface CatalogItemCreate {
  name: string
  description: string
  basePrice: number
  estimatedHours: number
}

// CatalogItemUpdateDTO
export interface CatalogItemUpdate extends CatalogItemCreate {
  active: boolean
}
