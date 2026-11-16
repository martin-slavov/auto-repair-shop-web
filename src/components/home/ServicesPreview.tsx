import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { getCatalogItems } from '@/api/catalog'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CatalogItem } from '@/types/catalog'

const gridClass = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'

function ServicesPreview() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    getCatalogItems()
      .then((page) => setItems(page.content.slice(0, 6)))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])

  let content: ReactNode

  if (loading) {
    content = (
      <div className={gridClass}>
        <p className="sr-only">Loading services…</p>
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} aria-hidden="true">
            <CardHeader className="gap-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardFooter>
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  } else if (failed) {
    content = <p className="text-muted-foreground">Services could not be loaded right now.</p>
  } else if (items.length === 0) {
    content = <p className="text-muted-foreground">No services available yet.</p>
  } else {
    content = (
      <div className={gridClass}>
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
              <CardDescription className="line-clamp-3">{item.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto justify-between text-sm">
              <span>
                <span className="text-muted-foreground">Price </span>
                <span className="font-semibold tabular-nums">{item.basePrice.toFixed(2)}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">
                {item.estimatedHours.toFixed(2)} h
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <section className="bg-muted py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2>Our services</h2>
        <p className="mt-2 mb-8 text-muted-foreground">
          A selection of what we do. Prices are base prices.
        </p>

        {content}

        <div className="mt-10 flex justify-center">
          <Link to="/services" className={buttonVariants({ size: 'lg' })}>
            View all services
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ServicesPreview
