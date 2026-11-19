import StatusBadge, { type StatusTone } from '@/components/StatusBadge'
import { SERVICE_VISIT_STATUS_LABELS, type ServiceVisitStatus } from '../../types/serviceVisit'

const STATUS_TONES: Record<ServiceVisitStatus, StatusTone> = {
  SCHEDULED: 'neutral',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  INVOICED: 'success',
}

function VisitStatusBadge({ status }: { status: ServiceVisitStatus }) {
  return (
    <StatusBadge tone={STATUS_TONES[status]}>{SERVICE_VISIT_STATUS_LABELS[status]}</StatusBadge>
  )
}

export default VisitStatusBadge
