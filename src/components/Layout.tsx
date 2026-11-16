import { NavLink, Outlet } from 'react-router'

function Layout() {
  return (
    <>
      <nav className="nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/services">Services</NavLink>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </>
  )
}

export default Layout
