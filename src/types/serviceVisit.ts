import type { PageQuery } from './api'

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
}

export type ServiceVisitSortField = 'scheduledDate' | 'completedDate' | 'status'

export type ServiceVisitQuery = PageQuery<ServiceVisitSortField> & {
  status?: ServiceVisitStatus | ''
  scheduledFrom?: string
  scheduledTo?: string
  licensePlate?: string
  vehicleId?: number
}
