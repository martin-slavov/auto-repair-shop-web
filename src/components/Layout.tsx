import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '../auth/useAuth'
import ChatWidget from './chat/ChatWidget'

const onDarkGhost =
  'text-background hover:bg-background/10 hover:text-background aria-expanded:bg-background/10 aria-expanded:text-background'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'border-b-2 py-1 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background',
    isActive
      ? 'border-primary text-background'
      : 'border-transparent text-background/80 hover:text-background',
  )
}

function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuLocationKey, setMenuLocationKey] = useState<string | null>(null)
  const menuOpen = menuLocationKey === location.key
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const canSeeVehicles = user?.role === 'CUSTOMER' || user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'
  const isMechanic = user?.role === 'MECHANIC'

  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuLocationKey(null)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  function closeMenu() {
    setMenuLocationKey(null)
  }

  function handleLogout() {
    logout()
    setMenuLocationKey(null)
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
      {(isCustomer || isAdmin) && (
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
      <NavLink
        to="/account"
        onClick={closeMenu}
        title={user.username}
        className={({ isActive }) =>
          cn(
            'min-w-0 max-w-64 truncate text-sm underline-offset-4 outline-none hover:text-background hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background',
            isActive ? 'text-background underline' : 'text-background/80',
          )
        }
      >
        <span className="sr-only">My account: </span>
        {user.username}
      </NavLink>
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
      <header className="border-b border-background/10 bg-foreground text-background">
        <div className="flex h-16 w-full items-center gap-6 px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2 font-heading text-xl font-bold tracking-wide whitespace-nowrap uppercase"
          >
            <span className="h-6 w-1.5 bg-primary" aria-hidden="true" />
            Auto Repair Shop
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">{links}</nav>

          <div className="ml-auto hidden min-w-0 items-center gap-3 lg:flex">{authArea}</div>

          <Button
            variant="ghost"
            size="icon"
            className={cn('ml-auto lg:hidden', onDarkGhost)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            ref={menuButtonRef}
            onClick={() => setMenuLocationKey(menuOpen ? null : location.key)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {menuOpen && (
          <div className="border-t border-background/10 px-6 py-4 lg:hidden">
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
        <div className="w-full px-6 py-6 text-sm lg:px-8">
          © {new Date().getFullYear()} Auto Repair Shop
        </div>
      </footer>

      <ChatWidget />
    </div>
  )
}

export default Layout
