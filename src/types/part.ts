import type { PageQuery } from './api'

// PartCatalogDTO
export interface PartCatalog {
  id: number
  name: string
  serialNumber: string
  unitSellPrice: number
  active: boolean
}

// PartResponseDTO
export interface PartAdmin extends PartCatalog {
  unitCost: number
}

export type PartSortField = 'name' | 'serialNumber' | 'unitSellPrice'

export type PartAdminSortField = PartSortField | 'unitCost'

type PartFilters = {
  name?: string
  serialNumber?: string
  minPrice?: string | number
  maxPrice?: string | number
}

export type PartQuery = PageQuery<PartSortField> & PartFilters

export type PartAdminQuery = PageQuery<PartAdminSortField> &
  PartFilters & {
    active?: boolean
  }

// PartCreateDTO
export interface PartCreate {
  name: string
  serialNumber: string
  unitCost: number
  unitSellPrice: number
}

// PartUpdateDTO
export interface PartUpdate extends PartCreate {
  active: boolean
}
