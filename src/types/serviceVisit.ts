import type { PageQuery } from './api'
import type { ServiceRequestType } from './serviceRequest'

export type ServiceVisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED'

export const SERVICE_VISIT_STATUS_ORDER: ServiceVisitStatus[] = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'INVOICED',
]

export const SERVICE_VISIT_STATUS_LABELS: Record<ServiceVisitStatus, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  INVOICED: 'Invoiced',
}

export type MechanicRole = 'LEAD' | 'ASSISTANT'

export const MECHANIC_ROLE_LABELS: Record<MechanicRole, string> = {
  LEAD: 'Lead',
  ASSISTANT: 'Assistant',
}

// MechanicAssignmentDTO
export interface MechanicAssignment {
  mechanicName: string
  roleInVisit: MechanicRole
  hoursWorked: number
  mechanicId: number | null
}

// ServiceVisitResponseDTO
export interface ServiceVisit {
  id: number
  status: ServiceVisitStatus
  scheduledDate: string
  completedDate: string | null
  technicalNotes: string | null
  licensePlate: string
  mechanics: MechanicAssignment[]
  requestType: ServiceRequestType | null
  requestDescription: string | null
  vehicleManufacturer: string
  vehicleModel: string
}

// ServiceVisitUpdateDTO
export interface ServiceVisitUpdate {
  scheduledDate: string
}

export function visitVehicleName(visit: ServiceVisit): string {
  return `${visit.vehicleManufacturer} ${visit.vehicleModel}`
}

export function sortMechanicsLeadFirst(mechanics: MechanicAssignment[]): MechanicAssignment[] {
  return [...mechanics].sort(
    (a, b) => Number(b.roleInVisit === 'LEAD') - Number(a.roleInVisit === 'LEAD'),
  )
}

export function currentMechanicRole(visit: ServiceVisit): MechanicRole | null {
  return visit.mechanics.length === 1 ? visit.mechanics[0].roleInVisit : null
}

// AvailableSlotDTO
export interface AvailableSlot {
  start: string
  available: boolean
}

// CompleteVisitDTO
export interface CompleteVisitBody {
  technicalNotes: string
  hoursWorked: number
}

// VisitPartResponseDTO
export interface VisitPart {
  id: number
  partName: string
  quantity: number
  priceAtTimeOfUse: number
  addedAt: string
}

// VisitPartCreateDTO
export interface VisitPartCreate {
  partId: number
  quantity: number
}

// VisitPartUpdateDTO
export interface VisitPartUpdate {
  quantity: number
}

export type ServiceVisitSortField = 'scheduledDate' | 'completedDate' | 'status'

export type ServiceVisitQuery = PageQuery<ServiceVisitSortField> & {
  status?: ServiceVisitStatus | ''
  scheduledFrom?: string
  scheduledTo?: string
  licensePlate?: string
  vehicleId?: number
  mechanicId?: number | ''
}
