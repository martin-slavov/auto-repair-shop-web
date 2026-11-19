import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/data-table/TablePagination'
import ConfirmActionDialog from '@/components/ConfirmActionDialog'
import CreateUserDialog from '@/components/users/CreateUserDialog'
import UserTable from '@/components/users/UserTable'
import { useDataTable, type FetchPage } from '@/hooks/useDataTable'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { getUsers, setUserEnabled } from '../api/adminUsers'
import { useAuth } from '../auth/useAuth'
import type { SortState } from '../types/api'
import type { RegisterResponse, Role } from '../types/auth'
import { USER_ROLE_LABELS, type UserAdmin, type UserSortField } from '../types/user'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const SUCCESS_MESSAGE_MS = 4000

type UserFilters = {
  username: string
  email: string
  role: Role | ''
  enabled: '' | 'true' | 'false'
}

const initialFilters: UserFilters = { username: '', email: '', role: '', enabled: '' }
const initialSort: SortState<UserSortField> = { field: 'username', direction: 'asc' }

const roleOptions = Object.entries(USER_ROLE_LABELS) as [Role, string][]

const fetchUserPage: FetchPage<UserAdmin, UserSortField, UserFilters> = (
  { page, size, sort, filters },
  signal,
) =>
  getUsers(
    {
      page,
      size,
      sort: `${sort.field},${sort.direction}`,
      username: filters.username,
      email: filters.email,
      role: filters.role,
      enabled: filters.enabled === '' ? undefined : filters.enabled === 'true',
    },
    signal,
  )

function AdminUsersPage() {
  useDocumentTitle('Users')
  const { user: currentUser } = useAuth()
  const table = useDataTable({
    fetchPage: fetchUserPage,
    initialSort,
    initialFilters,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [toggleOpen, setToggleOpen] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<UserAdmin | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [success])

  function openToggle(user: UserAdmin) {
    setToggleTarget(user)
    setToggleOpen(true)
  }

  function handleCreated(user: RegisterResponse) {
    setCreateOpen(false)
    setSuccess(`User ${user.username} (${USER_ROLE_LABELS[user.role]}) was created.`)
    table.refresh()
  }

  function handleToggled(user: UserAdmin) {
    setToggleOpen(false)
    setSuccess(`User ${user.username} was ${user.enabled ? 'disabled' : 'enabled'}.`)
    if (table.filters.enabled !== '') {
      table.refreshAfterRowRemoved()
    } else {
      table.refresh()
    }
  }

  const disabling = toggleTarget?.enabled ?? false

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Users</h1>
          <p className="mt-2 text-muted-foreground">
            All accounts. Add mechanics and admins, and enable or disable access.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          Add user
        </Button>
      </div>

      {success && (
        <p
          role="status"
          className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-text"
        >
          {success}
        </p>
      )}

      <Card>
        <CardContent className="flex flex-col gap-6">
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_9rem_9rem_auto]"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="users-username">Username</Label>
              <Input
                id="users-username"
                maxLength={50}
                type="search"
                value={table.filters.username}
                onChange={(event) => table.setFilter('username', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="users-email">Email</Label>
              <Input
                id="users-email"
                maxLength={254}
                type="search"
                value={table.filters.email}
                onChange={(event) => table.setFilter('email', event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="users-role">Role</Label>
              <select
                id="users-role"
                value={table.filters.role}
                onChange={(event) => table.setFilter('role', event.target.value as Role | '')}
                className={SELECT_CLASS}
              >
                <option value="">All</option>
                {roleOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="users-enabled">Status</Label>
              <select
                id="users-enabled"
                value={table.filters.enabled}
                onChange={(event) =>
                  table.setFilter('enabled', event.target.value as UserFilters['enabled'])
                }
                className={SELECT_CLASS}
              >
                <option value="">All</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
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

          <UserTable
            rows={table.rows}
            sort={table.sort}
            onSortChange={table.toggleSort}
            loading={table.loading}
            error={table.error && `Could not load users: ${table.error}`}
            emptyMessage={table.hasActiveFilters ? 'No users match your filters.' : 'No users yet.'}
            currentUsername={currentUser?.username}
            onToggleEnabled={openToggle}
          />
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

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />

      <ConfirmActionDialog
        open={toggleOpen}
        title={disabling ? 'Disable user?' : 'Enable user?'}
        description={
          toggleTarget &&
          (disabling
            ? `${toggleTarget.username} will no longer be able to log in and will be signed out on their next request.`
            : `${toggleTarget.username} will be able to log in again.`)
        }
        confirmLabel={disabling ? 'Disable' : 'Enable'}
        pendingLabel={disabling ? 'Disabling…' : 'Enabling…'}
        confirmVariant={disabling ? 'destructive' : 'default'}
        onOpenChange={setToggleOpen}
        onConfirm={async () => {
          if (toggleTarget) await setUserEnabled(toggleTarget.id, !toggleTarget.enabled)
        }}
        onDone={() => {
          if (toggleTarget) handleToggled(toggleTarget)
        }}
        onRefreshNeeded={table.refresh}
      />
    </>
  )
}

export default AdminUsersPage
