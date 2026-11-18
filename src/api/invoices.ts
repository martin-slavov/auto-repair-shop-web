import type { PageResponse } from '../types/api'
import type { Invoice, InvoiceQuery } from '../types/invoice'
import { apiGet, buildQueryString } from './client'

export function getInvoices(
  query: InvoiceQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<Invoice>> {
  return apiGet<PageResponse<Invoice>>('/api/invoices' + buildQueryString(query), signal)
}

export function getInvoice(id: number, signal?: AbortSignal): Promise<Invoice> {
  return apiGet<Invoice>(`/api/invoices/${id}`, signal)
}
