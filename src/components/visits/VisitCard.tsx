import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDateTime } from '../../lib/date'
import type { ServiceVisit } from '../../types/serviceVisit'
import VisitStatusStepper from './VisitStatusStepper'

interface VisitCardProps {
  visit: ServiceVisit
  onDetails: (visit: ServiceVisit) => void
}

function VisitCard({ visit, onDetails }: VisitCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="w-fit rounded-md border-2 border-foreground bg-background px-2 py-0.5 font-bold tracking-widest uppercase">
            {visit.licensePlate}
          </span>
          <Button variant="outline" size="sm" onClick={() => onDetails(visit)}>
            <Info aria-hidden="true" />
            Details<span className="sr-only"> of the visit for {visit.licensePlate}</span>
          </Button>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-1">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Scheduled</dt>
            <dd className="tabular-nums">{formatDateTime(visit.scheduledDate)}</dd>
          </div>
          {visit.completedDate && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="tabular-nums">{formatDateTime(visit.completedDate)}</dd>
            </div>
          )}
        </dl>
      </CardHeader>
      <CardContent>
        <VisitStatusStepper status={visit.status} />
      </CardContent>
    </Card>
  )
}

export default VisitCard
