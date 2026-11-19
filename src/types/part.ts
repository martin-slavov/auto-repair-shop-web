import type { PageQuery } from './api'

// PartCatalogDTO
export interface PartCatalog {
  id: number
  name: string
  serialNumber: string
  unitSellPrice: number
  active: boolean
}

export type PartSortField = 'name' | 'serialNumber' | 'unitSellPrice'

export type PartQuery = PageQuery<PartSortField> & {
  name?: string
  serialNumber?: string
}
