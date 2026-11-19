import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import InvoiceDocument from '@/components/invoices/InvoiceDocument'
import { getInvoice } from '../api/invoices'
import type { InvoiceDetail } from '../types/invoice'

interface LoadResult {
  id: number
  invoice: InvoiceDetail | null
  error: string | null
}

function InvoiceViewPage() {
  const params = useParams()
  const invoiceId = Number(params.id)
  const validId = Number.isInteger(invoiceId) && invoiceId > 0

  const [result, setResult] = useState<LoadResult | null>(null)

  useEffect(() => {
    if (!validId) return
    const controller = new AbortController()
    getInvoice(invoiceId, controller.signal)
      .then((invoice) => setResult({ id: invoiceId, invoice, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setResult({ id: invoiceId, invoice: null, error: message })
      })
    return () => controller.abort()
  }, [invoiceId, validId])

  const current = result?.id === invoiceId ? result : null
  const loading = validId && current === null
  const error = validId ? current?.error : 'Invoice not found.'
  const invoice = current?.invoice ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link to="/invoices" className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft aria-hidden="true" />
          Back to invoices
        </Link>
        <Button onClick={() => window.print()} disabled={!invoice}>
          <Printer aria-hidden="true" />
          Print
        </Button>
      </div>

      {loading && (
        <div aria-busy="true" className="h-96 animate-pulse rounded-xl bg-muted">
          <p className="sr-only">Loading…</p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {validId ? `Could not load the invoice: ${error}` : error}
        </p>
      )}

      {invoice && <InvoiceDocument invoice={invoice} />}
    </div>
  )
}

export default InvoiceViewPage
