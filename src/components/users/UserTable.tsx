import { UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DataTable, { type DataTableColumn } from '@/components/data-table/DataTable'
import type { SortState } from '../../types/api'
import type { UserAdmin, UserSortField } from '../../types/user'
import UserEnabledBadge from './UserEnabledBadge'
import UserRoleBadge from './UserRoleBadge'

interface UserTableProps {
  rows: UserAdmin[] | null
  sort: SortState<UserSortField>
  onSortChange: (field: UserSortField) => void
  loading: boolean
  error: string | null
  emptyMessage: string
  currentUsername: string | undefined
  onToggleEnabled: (user: UserAdmin) => void
}

function UserTable({
  rows,
  sort,
  onSortChange,
  loading,
  error,
  emptyMessage,
  currentUsername,
  onToggleEnabled,
}: UserTableProps) {
  const columns: DataTableColumn<UserAdmin, UserSortField>[] = [
    {
      id: 'username',
      header: 'Username',
      sortField: 'username',
      className: 'min-w-32 whitespace-normal font-medium',
      cell: (user) => (
        <div title={user.username} className="line-clamp-2 wrap-anywhere">
          {user.username}
          {user.username === currentUsername && (
            <span className="font-normal text-muted-foreground"> (you)</span>
          )}
        </div>
      ),
    },
    {
      id: 'name',
      header: 'Name',
      className: 'min-w-32 whitespace-normal',
      cell: (user) => {
        const name = `${user.firstName} ${user.lastName}`
        return (
          <div title={name} className="line-clamp-2 wrap-anywhere">
            {name}
          </div>
        )
      },
    },
    {
      id: 'email',
      header: 'Email',
      sortField: 'email',
      className: 'w-full min-w-40 whitespace-normal',
      cell: (user) => (
        <div title={user.email} className="line-clamp-2 wrap-anywhere">
          {user.email}
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      sortField: 'role',
      cell: (user) => <UserRoleBadge role={user.role} />,
    },
    {
      id: 'enabled',
      header: 'Status',
      sortField: 'enabled',
      cell: (user) => <UserEnabledBadge enabled={user.enabled} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      cell: (user) =>
        user.username !== currentUsername && (
          <div className="flex flex-nowrap justify-end gap-2">
            {user.enabled ? (
              <Button variant="destructive" size="sm" onClick={() => onToggleEnabled(user)}>
                <UserX aria-hidden="true" />
                Disable<span className="sr-only"> {user.username}</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onToggleEnabled(user)}>
                <UserCheck aria-hidden="true" />
                Enable<span className="sr-only"> {user.username}</span>
              </Button>
            )}
          </div>
        ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(user) => user.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  )
}

export default UserTable
