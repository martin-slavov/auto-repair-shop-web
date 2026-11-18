import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '../../lib/date'
import { SERVICE_REQUEST_TYPE_LABELS, type ServiceRequest } from '../../types/serviceRequest'
import type { Vehicle } from '../../types/vehicle'
import ServiceRequestStatusBadge from './ServiceRequestStatusBadge'

interface ServiceRequestCardProps {
  request: ServiceRequest
  vehicle?: Vehicle
  onEdit: (request: ServiceRequest) => void
  onDelete: (request: ServiceRequest) => void
}

function ServiceRequestCard({ request, vehicle, onEdit, onDelete }: ServiceRequestCardProps) {
  const isPending = request.status === 'PENDING'

  return (
    <Card size="sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ServiceRequestStatusBadge status={request.status} />
          <time dateTime={request.createdAt} className="text-muted-foreground tabular-nums">
            Created {formatDateTime(request.createdAt)}
          </time>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-fit rounded-md border-2 border-foreground bg-background px-2 py-0.5 font-bold tracking-widest uppercase">
            {request.licensePlate}
          </span>
          {vehicle && (
            <CardTitle className="text-lg">
              {vehicle.manufacturer} {vehicle.model}
            </CardTitle>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Type</dt>
          <dd>{SERVICE_REQUEST_TYPE_LABELS[request.type]}</dd>
          <dt className="text-muted-foreground">Preferred date</dt>
          <dd className="tabular-nums">{request.preferredDate ?? '—'}</dd>
        </dl>
        <p className="break-words whitespace-pre-line">{request.description}</p>
      </CardContent>
      {isPending && (
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(request)}>
            <Pencil aria-hidden="true" />
            Edit<span className="sr-only"> request for {request.licensePlate}</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(request)}>
            <Trash2 aria-hidden="true" />
            Delete<span className="sr-only"> request for {request.licensePlate}</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export default ServiceRequestCard
