import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import DataCardList from '@/components/data-table/DataCardList'
import SortControl, { type SortOption } from '@/components/data-table/SortControl'
import ConfirmActionDialog from '@/components/ConfirmActionDialog'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import ApproveServiceRequestDialog from '@/components/service-requests/ApproveServiceRequestDialog'
import ServiceRequestCard from '@/components/service-requests/ServiceRequestCard'
import ServiceRequestTable from '@/components/service-requests/ServiceRequestTable'
import ServiceRequestFormDialog from '@/components/service-requests/ServiceRequestFormDialog'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { useCustomerVehicles } from '@/hooks/useCustomerVehicles'
import { useMechanics } from '@/hooks/useMechanics'
import {
  deleteServiceRequest,
  getServiceRequests,
  rejectServiceRequest,
} from '../api/serviceRequests'
import { useAuth } from '../auth/useAuth'
import type { SortState } from '../types/api'
import {
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_TYPE_LABELS,
  type ServiceRequest,
  type ServiceRequestSortField,
  type ServiceRequestStatus,
  type ServiceRequestType,
} from '../types/serviceRequest'

const SUCCESS_MESSAGE_MS = 4000

type ServiceRequestFilters = {
  licensePlate: string
  status: ServiceRequestStatus | ''
  type: ServiceRequestType | ''
}

const initialFilters: ServiceRequestFilters = { licensePlate: '', status: '', type: '' }
const initialSort: SortState<ServiceRequestSortField> = { field: 'createdAt', direction: 'desc' }

const sortOptions: SortOption<ServiceRequestSortField>[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'preferredDate', label: 'Preferred date' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Type' },
]

const statusOptions = Object.entries(SERVICE_REQUEST_STATUS_LABELS) as [
  ServiceRequestStatus,
  string,
][]
const typeOptions = Object.entries(SERVICE_REQUEST_TYPE_LABELS) as [ServiceRequestType, string][]

const fetchServiceRequestPage: FetchPage<
  ServiceRequest,
  ServiceRequestSortField,
  ServiceRequestFilters
> = ({ page, size, sort, filters }, signal) =>
  getServiceRequests(
    {
      page,
      size,
      sort: `${sort.field},${sort.direction}`,
      licensePlate: filters.licensePlate,
      status: filters.status,
      type: filters.type,
    },
    signal,
  )

interface SuccessMessage {
  text: string
}

function ServiceRequestsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'

  const table = useDataTable({
    fetchPage: fetchServiceRequestPage,
    initialSort,
    initialFilters,
  })
  const { vehicles, error: vehiclesError } = useCustomerVehicles(isCustomer)

  const vehiclesByPlate = useMemo(
    () => new Map((vehicles ?? []).map((vehicle) => [vehicle.licensePlate, vehicle])),
    [vehicles],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formRequest, setFormRequest] = useState<ServiceRequest | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceRequest | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [approveTarget, setApproveTarget] = useState<ServiceRequest | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<ServiceRequest | null>(null)
  const [success, setSuccess] = useState<SuccessMessage | null>(null)
  const { mechanics, error: mechanicsError } = useMechanics(isAdmin, { onlyEnabled: true })

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [success])

  function openCreate() {
    setFormRequest(null)
    setFormOpen(true)
  }

  function openEdit(request: ServiceRequest) {
    setFormRequest(request)
    setFormOpen(true)
  }

  function openDelete(request: ServiceRequest) {
    setDeleteTarget(request)
    setDeleteOpen(true)
  }

  function handleSaved(request: ServiceRequest, mode: 'created' | 'updated') {
    setFormOpen(false)
    setSuccess({ text: `Service request for ${request.licensePlate} was ${mode}.` })
    table.refresh()
  }

  function openApprove(request: ServiceRequest) {
    setApproveTarget(request)
    setApproveOpen(true)
  }

  function openReject(request: ServiceRequest) {
    setRejectTarget(request)
    setRejectOpen(true)
  }

  function handleDeleted(request: ServiceRequest) {
    setDeleteOpen(false)
    setSuccess({ text: `Service request for ${request.licensePlate} was deleted.` })
    table.refreshAfterRowRemoved()
  }

  function handleDecided(request: ServiceRequest, decision: 'approved' | 'rejected') {
    setApproveOpen(false)
    setRejectOpen(false)
    setSuccess({ text: `Request for ${request.licensePlate} was ${decision}.` })
    if (table.filters.status !== '') {
      table.refreshAfterRowRemoved()
    } else {
      table.refresh()
    }
  }

  const loadError = table.error && `Could not load service requests: ${table.error}`

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Service requests</h1>
          <p className="mt-2 text-muted-foreground">
            {isAdmin
              ? 'All service requests from customers, in every status.'
              : 'Your requests for service, inspection or consultation.'}
          </p>
        </div>
        {isCustomer && (
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" />
            New request
          </Button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {success.text}
        </p>
      )}

      <Card>
        <CardContent className="flex flex-col gap-6">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_10rem_10rem_auto]"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="requests-license-plate">License plate</Label>
              <Input
                id="requests-license-plate"
                type="search"
                placeholder="e.g. CA1234"
                value={table.filters.licensePlate}
                onChange={(event) => table.setFilter('licensePlate', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="requests-status">Status</Label>
              <select
                id="requests-status"
                value={table.filters.status}
                onChange={(event) =>
                  table.setFilter('status', event.target.value as ServiceRequestStatus | '')
                }
                className={SELECT_CLASS}
              >
                <option value="">All</option>
                {statusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="requests-type">Type</Label>
              <select
                id="requests-type"
                value={table.filters.type}
                onChange={(event) =>
                  table.setFilter('type', event.target.value as ServiceRequestType | '')
                }
                className={SELECT_CLASS}
              >
                <option value="">All</option>
                {typeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!table.hasActiveFilters}
              onClick={table.clearFilters}
            >
              Clear filters
            </Button>
          </form>

          {isAdmin ? (
            <ServiceRequestTable
              rows={table.rows}
              sort={table.sort}
              onSortChange={table.toggleSort}
              loading={table.loading}
              error={loadError}
              emptyMessage={
                table.hasActiveFilters
                  ? 'No requests match your filters.'
                  : 'No service requests yet.'
              }
              onApprove={openApprove}
              onReject={openReject}
            />
          ) : (
            <>
              <SortControl
                options={sortOptions}
                sort={table.sort}
                onSortChange={table.toggleSort}
              />
              <DataCardList
                rows={table.rows}
                getRowKey={(request) => request.id}
                renderItem={(request) => (
                  <ServiceRequestCard
                    request={request}
                    vehicle={vehiclesByPlate.get(request.licensePlate)}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                )}
                className="flex flex-col gap-4"
                skeletonCount={3}
                skeletonClassName="h-48"
                loading={table.loading}
                error={loadError}
                emptyState={
                  table.hasActiveFilters ? (
                    <p>No requests match your filters.</p>
                  ) : (
                    <>
                      <p>You have no service requests yet.</p>
                      <Button onClick={openCreate}>
                        <Plus aria-hidden="true" />
                        New request
                      </Button>
                    </>
                  )
                }
              />
            </>
          )}
        </CardContent>
        <CardFooter>
          <TablePagination
            page={table.page}
            pageSize={table.pageSize}
            totalPages={table.data?.totalPages ?? 0}
            totalElements={table.data?.totalElements ?? 0}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        </CardFooter>
      </Card>

      {isCustomer && (
        <>
          <ServiceRequestFormDialog
            open={formOpen}
            request={formRequest}
            vehicles={vehicles}
            vehiclesError={vehiclesError}
            onOpenChange={setFormOpen}
            onSaved={handleSaved}
            onRefreshNeeded={table.refresh}
          />

          <ConfirmDeleteDialog
            open={deleteOpen}
            title="Delete service request?"
            description={
              deleteTarget &&
              `The ${SERVICE_REQUEST_TYPE_LABELS[deleteTarget.type].toLowerCase()} request for ${deleteTarget.licensePlate} will be deleted permanently. This cannot be undone.`
            }
            onOpenChange={setDeleteOpen}
            onConfirm={async () => {
              if (deleteTarget) await deleteServiceRequest(deleteTarget.id)
            }}
            onDeleted={() => {
              if (deleteTarget) handleDeleted(deleteTarget)
            }}
            onRefreshNeeded={table.refresh}
          />
        </>
      )}

      {isAdmin && (
        <>
          <ApproveServiceRequestDialog
            open={approveOpen}
            request={approveTarget}
            mechanics={mechanics}
            mechanicsError={mechanicsError}
            onOpenChange={setApproveOpen}
            onApproved={(request) => handleDecided(request, 'approved')}
            onRefreshNeeded={table.refresh}
          />

          <ConfirmActionDialog
            open={rejectOpen}
            title="Reject service request?"
            description={
              rejectTarget &&
              `The ${SERVICE_REQUEST_TYPE_LABELS[rejectTarget.type].toLowerCase()} request for ${rejectTarget.licensePlate} will be rejected. This cannot be undone.`
            }
            confirmLabel="Reject"
            pendingLabel="Rejecting…"
            confirmVariant="destructive"
            onOpenChange={setRejectOpen}
            onConfirm={async () => {
              if (rejectTarget) await rejectServiceRequest(rejectTarget.id)
            }}
            onDone={() => {
              if (rejectTarget) handleDecided(rejectTarget, 'rejected')
            }}
            onRefreshNeeded={table.refresh}
          />
        </>
      )}
    </>
  )
}

export default ServiceRequestsPage
