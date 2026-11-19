import type { PageQuery } from './api'

// InvoiceResponseDTO
export interface Invoice {
  id: number
  invoiceNumber: string
  licensePlate: string
  partsPrice: number
  laborPrice: number
  totalPrice: number
  issuedDate: string
  paid: boolean
}

// InvoicePartLineDTO
export interface InvoicePartLine {
  partName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

// InvoiceDetailDTO
export interface InvoiceDetail extends Invoice {
  laborHours?: number
  laborRate?: number
  partLines?: InvoicePartLine[]
}

export type InvoiceSortField = 'invoiceNumber' | 'totalPrice' | 'issuedDate' | 'paid'

export type PaidFilter = 'true' | 'false' | ''

export type InvoiceQuery = PageQuery<InvoiceSortField> & {
  paid?: PaidFilter
  invoiceNumber?: string
  licensePlate?: string
  issuedFrom?: string
  issuedTo?: string
  minTotal?: string | number
  maxTotal?: string | number
}
