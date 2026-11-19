import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/auth/useAuth'
import { cn } from '@/lib/utils'

function HeroSection() {
  const { user } = useAuth()

  let secondaryLink: { to: string; label: string } | null = null
  if (!user) {
    secondaryLink = { to: '/register', label: 'Create account' }
  } else if (user.role === 'CUSTOMER' || user.role === 'ADMIN') {
    secondaryLink = { to: '/vehicles', label: 'My vehicles' }
  }

  return (
    <section className="relative overflow-hidden bg-foreground bg-[url('/hero.jpg')] bg-cover bg-center text-background">
      <div
        className="absolute inset-0 bg-linear-to-r from-foreground via-foreground/85 to-foreground/40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-24 md:pt-24 md:pb-32">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 font-heading text-lg font-semibold tracking-wide text-primary uppercase">
            <span className="h-5 w-1.5 bg-primary" aria-hidden="true" />
            Auto Repair Shop
          </p>
          <h1 className="mt-4 text-5xl leading-none text-balance uppercase md:text-7xl">
            Keep your car on the road
          </h1>
          <p className="mt-6 text-lg text-background/80">
            Servicing, inspections and repairs, with clear prices you can check online before you
            visit.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/services" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 text-base')}>
              Browse services
            </Link>
            {secondaryLink && (
              <Link
                to={secondaryLink.to}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-11 border-background/40 bg-transparent px-6 text-base text-background hover:bg-background/10 hover:text-background',
                )}
              >
                {secondaryLink.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
