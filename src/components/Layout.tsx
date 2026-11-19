import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { Menu, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '../auth/useAuth'

const onDarkGhost =
  'text-background hover:bg-background/10 hover:text-background aria-expanded:bg-background/10 aria-expanded:text-background'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'border-b-2 py-1 text-sm font-medium transition-colors',
    isActive
      ? 'border-primary text-background'
      : 'border-transparent text-background/80 hover:text-background',
  )
}

function Layout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const canSeeVehicles = user?.role === 'CUSTOMER' || user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'
  const isMechanic = user?.role === 'MECHANIC'

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleLogout() {
    logout()
    setMenuOpen(false)
  }

  const links = (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
        Home
      </NavLink>
      <NavLink to="/services" className={navLinkClass} onClick={closeMenu}>
        Services
      </NavLink>
      {canSeeVehicles && (
        <>
          <NavLink to="/vehicles" className={navLinkClass} onClick={closeMenu}>
            Vehicles
          </NavLink>
          <NavLink to="/service-requests" className={navLinkClass} onClick={closeMenu}>
            Service requests
          </NavLink>
          <NavLink to="/visits" className={navLinkClass} onClick={closeMenu}>
            Visits
          </NavLink>
        </>
      )}
      {isMechanic && (
        <NavLink to="/visits" className={navLinkClass} onClick={closeMenu}>
          Visits
        </NavLink>
      )}
      {isCustomer && (
        <NavLink to="/invoices" className={navLinkClass} onClick={closeMenu}>
          Invoices
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={navLinkClass} onClick={closeMenu}>
          Admin
        </NavLink>
      )}
    </>
  )

  const authArea = user ? (
    <>
      <span className="text-sm text-background/80">
        {user.username} ({user.role})
      </span>
      <Button variant="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </>
  ) : (
    <>
      <Link
        to="/login"
        onClick={closeMenu}
        className={cn(buttonVariants({ variant: 'ghost' }), onDarkGhost)}
      >
        Login
      </Link>
      <Link to="/register" onClick={closeMenu} className={buttonVariants()}>
        Register
      </Link>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-foreground text-background">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-8 px-4">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 font-heading text-xl font-bold tracking-wide uppercase"
          >
            <span className="h-6 w-1.5 bg-primary" aria-hidden="true" />
            Auto Repair Shop
          </Link>

          <nav className="hidden items-center gap-6 md:flex">{links}</nav>

          <div className="ml-auto hidden items-center gap-3 md:flex">{authArea}</div>

          <Button
            variant="ghost"
            size="icon"
            className={cn('ml-auto md:hidden', onDarkGhost)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {menuOpen && (
          <div className="border-t border-background/10 px-4 py-4 md:hidden">
            <nav className="flex flex-col items-start gap-3">{links}</nav>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-background/10 pt-4">
              {authArea}
            </div>
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col bg-muted">
        <Outlet />
      </main>

      <footer className="bg-foreground text-background/70">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm">
          © {new Date().getFullYear()} Auto Repair Shop
        </div>
      </footer>
    </div>
  )
}

export default Layout
