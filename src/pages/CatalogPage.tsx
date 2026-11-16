import { useEffect, useState, type ReactNode } from 'react'
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
    content = <p>Loading services…</p>
  } else if (error) {
    content = <p className="error">Could not load services: {error}</p>
  } else if (!data || data.content.length === 0) {
    content = <p>No services available.</p>
  } else {
    content = (
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

  return (
    <>
      <h1>Services</h1>
      {content}
    </>
  )
}

export default CatalogPage
