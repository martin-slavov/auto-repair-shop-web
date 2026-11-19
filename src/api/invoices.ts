import type { PageResponse } from '../types/api'
import type { Invoice, InvoiceDetail, InvoiceQuery } from '../types/invoice'
import { apiDelete, apiGet, apiPatch, buildQueryString } from './client'

export function getInvoices(
  query: InvoiceQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<Invoice>> {
  return apiGet<PageResponse<Invoice>>('/api/invoices' + buildQueryString(query), signal)
}

export function getInvoice(id: number, signal?: AbortSignal): Promise<InvoiceDetail> {
  return apiGet<InvoiceDetail>(`/api/invoices/${id}`, signal)
}

export function payInvoice(id: number): Promise<Invoice> {
  return apiPatch<Invoice>(`/api/invoices/${id}/pay`)
}

export function deleteInvoice(id: number): Promise<void> {
  return apiDelete(`/api/invoices/${id}`)
}
