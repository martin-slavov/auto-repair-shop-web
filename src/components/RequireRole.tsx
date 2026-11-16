import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth'
import ForbiddenPage from '../pages/ForbiddenPage'
import type { Role } from '../types/auth'

function RequireRole({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <ForbiddenPage />
  }

  return <Outlet />
}

export default RequireRole
