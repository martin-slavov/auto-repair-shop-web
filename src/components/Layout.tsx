import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth'

function Layout() {
  const { user, logout } = useAuth()

  return (
    <>
      <nav className="nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/services">Services</NavLink>

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
            <NavLink to="/login">Login</NavLink>
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
