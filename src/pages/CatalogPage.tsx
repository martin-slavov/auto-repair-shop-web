import { useEffect, useState, type ReactNode } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCatalogItems } from '../api/catalog'
import type { PageResponse } from '../types/api'
import type { CatalogItem } from '../types/catalog'

function CatalogPage() {
  const [data, setData] = useState<PageResponse<CatalogItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCatalogItems()
      .then((page) => setData(page))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }, [])
  
  let content: ReactNode

  if (loading) {
    content = (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <p className="sr-only">Loading services…</p>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-6 animate-pulse rounded bg-muted" aria-hidden="true" />
          ))}
        </CardContent>
      </Card>
    )
  } else if (error) {
    content = (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        Could not load services: {error}
      </p>
    )
  } else if (!data || data.content.length === 0) {
    content = (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">No services available.</p>
        </CardContent>
      </Card>
    )
  } else {
    content = (
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Est. hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="min-w-64 whitespace-normal">{item.description}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.basePrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.estimatedHours.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Showing {data.content.length} of {data.totalElements} services
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <h1>Services</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Base prices and estimated hours for all our services.
      </p>
      {content}
    </>
  )
}

export default CatalogPage
