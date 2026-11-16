import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth'

function Layout() {
  const { user, logout } = useAuth()

  const canSeeVehicles = user?.role === 'CUSTOMER' || user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <>
      <nav className="nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/services">Services</NavLink>
        {canSeeVehicles && <NavLink to="/vehicles">Vehicles</NavLink>}
        {isAdmin && <NavLink to="/admin/users">Admin</NavLink>}

        <div className="nav-user">
          {user ? (
            <>
              <span>
                {user.username} ({user.role})
              </span>
              <button type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </>
  )
}

export default Layout
