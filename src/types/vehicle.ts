import type { PageQuery } from './api'

// VehicleResponseDTO
export interface Vehicle {
  id: number
  licensePlate: string
  manufacturer: string
  model: string
  year: number
  ownerId: number
  ownerName: string
  firstRegistrationDate: string | null
}

// VehicleCreateDTO / VehicleUpdateDTO
export interface VehicleRequest {
  licensePlate: string
  manufacturer: string
  model: string
  year: number
  firstRegistrationDate: string | null
}

export type VehicleSortField =
  | 'licensePlate'
  | 'manufacturer'
  | 'model'
  | 'year'
  | 'firstRegistrationDate'

export type VehicleQuery = PageQuery<VehicleSortField> & {
  licensePlate?: string
  manufacturer?: string
  model?: string
  yearFrom?: string | number
  yearTo?: string | number
  ownerId?: number
}
