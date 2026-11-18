import type { PageResponse } from '../types/api'
import type { Vehicle, VehicleQuery, VehicleRequest } from '../types/vehicle'
import { apiDelete, apiGet, apiPost, apiPut, buildQueryString } from './client'

export function getVehicles(
  query: VehicleQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<Vehicle>> {
  return apiGet<PageResponse<Vehicle>>('/api/vehicles' + buildQueryString(query), signal)
}

export function createVehicle(body: VehicleRequest): Promise<Vehicle> {
  return apiPost<Vehicle>('/api/vehicles', body)
}

export function updateVehicle(id: number, body: VehicleRequest): Promise<Vehicle> {
  return apiPut<Vehicle>(`/api/vehicles/${id}`, body)
}

export function deleteVehicle(id: number): Promise<void> {
  return apiDelete(`/api/vehicles/${id}`)
}
