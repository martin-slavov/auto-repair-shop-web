// Matches CatalogItemResponseDTO (api-reference.md, section 4.0).
export interface CatalogItem {
  id: number
  name: string
  description: string
  basePrice: number // JSON number: 30.00 arrives as 30, so format it for display
  active: boolean
  createdAt: string // ISO local date-time without time zone, e.g. "2026-11-20T09:00:00"
  estimatedHours: number
}
