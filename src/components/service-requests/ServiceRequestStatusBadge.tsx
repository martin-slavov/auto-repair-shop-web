import StatusBadge, { type StatusTone } from '@/components/StatusBadge'
import {
  SERVICE_REQUEST_STATUS_LABELS,
  type ServiceRequestStatus,
} from '../../types/serviceRequest'

const STATUS_TONES: Record<ServiceRequestStatus, StatusTone> = {
  PENDING: 'neutral',
  APPROVED: 'success',
  REJECTED: 'destructive',
}

function ServiceRequestStatusBadge({ status }: { status: ServiceRequestStatus }) {
  return (
    <StatusBadge tone={STATUS_TONES[status]}>{SERVICE_REQUEST_STATUS_LABELS[status]}</StatusBadge>
  )
}

export default ServiceRequestStatusBadge
