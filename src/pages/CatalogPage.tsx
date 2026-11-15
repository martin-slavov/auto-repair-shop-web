import { useEffect, useState } from 'react'
import { getCatalogItems } from '../api/catalog'
import type { PageResponse } from '../types/api'
import type { CatalogItem } from '../types/catalog'

function CatalogPage() {
  const [data, setData] = useState<PageResponse<CatalogItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // The empty dependency array [] means: run this only once, when the page
  // first appears. Without it, the effect would run after every render.
  // Note: in development, React StrictMode runs effects twice on purpose,
  // so you will see two requests in the Network tab. That is normal.
  useEffect(() => {
    getCatalogItems()
      .then((page) => setData(page))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p>Loading services…</p>
  }

  if (error) {
    return <p className="error">Could not load services: {error}</p>
  }

  if (!data || data.content.length === 0) {
    return <p>No services available.</p>
  }

  return (
    <>
      <table className="catalog-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th className="number">Price</th>
            <th className="number">Est. hours</th>
          </tr>
        </thead>
        <tbody>
          {data.content.map((item) => (
            // React needs a unique "key" for each row in a list.
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td className="number">{item.basePrice.toFixed(2)}</td>
              <td className="number">{item.estimatedHours.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">
        Showing {data.content.length} of {data.totalElements} services
      </p>
    </>
  )
}

export default CatalogPage
