import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/useAuth'
import ForbiddenPage from '../pages/ForbiddenPage'
import type { Role } from '../types/auth'

function RequireRole({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user, logoutReason } = useAuth()
  const location = useLocation()

  if (!user) {
    const state =
      logoutReason === 'manual'
        ? undefined
        : {
            from: location.pathname + location.search,
            expired: logoutReason === 'expired',
          }
    return <Navigate to="/login" replace state={state} />
  }

  if (!allowedRoles.includes(user.role)) {
    return <ForbiddenPage />
  }

  return <Outlet />
}

export default RequireRole
