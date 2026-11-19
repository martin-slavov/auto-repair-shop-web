import { SERVICE_REQUEST_TYPE_LABELS } from '../../types/serviceRequest'
import { visitVehicleName, type ServiceVisit } from '../../types/serviceVisit'

function VisitJobSummary({ visit }: { visit: ServiceVisit }) {
  const typeLabel = visit.requestType ? SERVICE_REQUEST_TYPE_LABELS[visit.requestType] : null

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-muted px-3 py-2 text-sm">
      <p className="font-medium wrap-anywhere">
        {visit.licensePlate} · {visitVehicleName(visit)}
      </p>
      {visit.requestDescription ? (
        <p title={visit.requestDescription} className="line-clamp-2 wrap-anywhere">
          {typeLabel && <span className="text-muted-foreground">{typeLabel}: </span>}
          {visit.requestDescription}
        </p>
      ) : (
        <p className="text-muted-foreground">
          {typeLabel && `${typeLabel}: `}No description available.
        </p>
      )}
    </div>
  )
}

export default VisitJobSummary
