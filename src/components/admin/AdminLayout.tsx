import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/utils'

const adminLinks = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/catalog', label: 'Catalog' },
  { to: '/admin/parts', label: 'Parts' },
]

function subNavLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground',
  )
}

function AdminLayout() {
  return (
    <>
      <nav
        aria-label="Admin"
        className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-lg border bg-muted p-1"
      >
        {adminLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={subNavLinkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  )
}

export default AdminLayout
