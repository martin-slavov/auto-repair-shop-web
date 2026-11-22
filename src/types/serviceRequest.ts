import type { PageQuery } from './api'

export type ServiceRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ServiceRequestType = 'SERVICE' | 'INSPECTION' | 'CONSULTATION'

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export const SERVICE_REQUEST_TYPE_LABELS: Record<ServiceRequestType, string> = {
  SERVICE: 'Service',
  INSPECTION: 'Inspection',
  CONSULTATION: 'Consultation',
}

export type PreferredPeriod = 'MORNING' | 'AFTERNOON' | 'ANY'

export const PREFERRED_PERIOD_LABELS: Record<PreferredPeriod, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  ANY: 'Any time',
}

// ServiceRequestResponseDTO
export interface ServiceRequest {
  id: number
  description: string
  status: ServiceRequestStatus
  type: ServiceRequestType
  createdAt: string
  licensePlate: string
  preferredDate: string | null
  preferredPeriod: PreferredPeriod | null
}

// ServiceRequestCreateDTO
export interface ServiceRequestCreate {
  vehicleId: number
  description: string
  preferredDate: string | null
  preferredPeriod: PreferredPeriod | null
  type: ServiceRequestType
}

// ServiceRequestUpdateDTO
export interface ServiceRequestUpdate {
  description: string
  preferredDate: string | null
  preferredPeriod: PreferredPeriod | null
  type: ServiceRequestType
}

// ApproveRequestDTO
export interface ServiceRequestApprove {
  mechanicId: number
  scheduledDate: string
}

export type ServiceRequestSortField = 'preferredDate' | 'status' | 'type' | 'createdAt'

export type ServiceRequestQuery = PageQuery<ServiceRequestSortField> & {
  status?: ServiceRequestStatus | ''
  type?: ServiceRequestType | ''
  preferredFrom?: string
  preferredTo?: string
  licensePlate?: string
  vehicleId?: number
}
