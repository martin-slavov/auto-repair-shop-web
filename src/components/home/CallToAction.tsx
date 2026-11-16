import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function CallToAction() {
  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
        <p className="font-heading text-3xl font-bold uppercase md:text-4xl">
          Find the right service for your car.
        </p>
        <Link to="/services" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 text-base')}>
          View services
        </Link>
      </div>
    </section>
  )
}

export default CallToAction
