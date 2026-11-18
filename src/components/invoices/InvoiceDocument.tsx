import { formatDateTime } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import type { Invoice } from '../../types/invoice'
import InvoicePaidBadge from './InvoicePaidBadge'

function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const lines = [
    { label: 'Parts', amount: invoice.partsPrice },
    { label: 'Labour', amount: invoice.laborPrice },
  ]

  return (
    <article
      aria-label={`Invoice ${invoice.invoiceNumber}`}
      className="invoice-print flex flex-col gap-8 rounded-xl bg-card p-6 text-sm text-card-foreground ring-1 ring-foreground/10 sm:p-10 print:rounded-none print:p-0 print:ring-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-foreground pb-6">
        <p className="font-heading text-2xl font-bold tracking-wide uppercase">Auto Repair Shop</p>
        <div className="text-right">
          <h1 className="text-4xl uppercase">Invoice</h1>
          <p className="mt-1 font-medium tabular-nums">{invoice.invoiceNumber}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Invoice number
          </dt>
          <dd className="tabular-nums">{invoice.invoiceNumber}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Issued
          </dt>
          <dd className="tabular-nums">{formatDateTime(invoice.issuedDate)}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Vehicle
          </dt>
          <dd className="font-bold tracking-widest uppercase">{invoice.licensePlate}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Status
          </dt>
          <dd>
            <InvoicePaidBadge paid={invoice.paid} />
          </dd>
        </div>
      </dl>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="py-2 font-medium">
              Description
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.label} className="border-b">
              <td className="py-3">{line.label}</td>
              <td className="py-3 text-right tabular-nums">{formatMoney(line.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-base font-bold">
            <th scope="row" className="pt-4 text-left">
              Total
            </th>
            <td className="pt-4 text-right tabular-nums">{formatMoney(invoice.totalPrice)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="border-t pt-6 text-center text-muted-foreground">
        Thank you for choosing Auto Repair Shop.
      </p>
    </article>
  )
}

export default InvoiceDocument
