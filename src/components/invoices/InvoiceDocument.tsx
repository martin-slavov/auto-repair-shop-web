import { cn } from '@/lib/utils'
import { formatDateTime } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import type { InvoiceDetail } from '../../types/invoice'
import InvoicePaidBadge from './InvoicePaidBadge'

const NUMBER_HEAD_CLASS = 'py-2 pl-4 text-right font-medium whitespace-nowrap'
const NUMBER_CELL_CLASS = 'py-3 pl-4 text-right align-top whitespace-nowrap tabular-nums'
const DETAIL_COLUMN_CLASS = 'hidden sm:table-cell print:table-cell'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function EmptyDetailCells() {
  return (
    <>
      <td className={DETAIL_COLUMN_CLASS} />
      <td className={DETAIL_COLUMN_CLASS} />
    </>
  )
}

function InvoiceDocument({ invoice }: { invoice: InvoiceDetail }) {
  const partLines = Array.isArray(invoice.partLines) ? invoice.partLines : null
  const laborDetail =
    isNumber(invoice.laborHours) && isNumber(invoice.laborRate)
      ? `${invoice.laborHours.toFixed(2)} h × ${formatMoney(invoice.laborRate)}`
      : null

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
            <th scope="col" className="w-full py-2 font-medium">
              Description
            </th>
            <th scope="col" className={cn(NUMBER_HEAD_CLASS, DETAIL_COLUMN_CLASS)}>
              Qty
            </th>
            <th scope="col" className={cn(NUMBER_HEAD_CLASS, DETAIL_COLUMN_CLASS)}>
              Unit price
            </th>
            <th scope="col" className={NUMBER_HEAD_CLASS}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {partLines ? (
            <>
              <tr className="break-inside-avoid">
                <th
                  scope="rowgroup"
                  className="pt-4 pb-1 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >
                  Parts
                </th>
                <EmptyDetailCells />
                <td />
              </tr>
              {partLines.length === 0 ? (
                <tr className="break-inside-avoid border-b">
                  <td className="py-3 text-muted-foreground">No parts used</td>
                  <EmptyDetailCells />
                  <td />
                </tr>
              ) : (
                partLines.map((line, index) => (
                  <tr key={index} className="break-inside-avoid border-b">
                    <td className="py-3 align-top wrap-anywhere">
                      {line.partName}
                      <span className="mt-0.5 block text-muted-foreground tabular-nums sm:hidden print:hidden">
                        {line.quantity} × {formatMoney(line.unitPrice)}
                      </span>
                    </td>
                    <td className={cn(NUMBER_CELL_CLASS, DETAIL_COLUMN_CLASS)}>{line.quantity}</td>
                    <td className={cn(NUMBER_CELL_CLASS, DETAIL_COLUMN_CLASS)}>
                      {formatMoney(line.unitPrice)}
                    </td>
                    <td className={NUMBER_CELL_CLASS}>{formatMoney(line.lineTotal)}</td>
                  </tr>
                ))
              )}
            </>
          ) : (
            <tr className="break-inside-avoid border-b">
              <td className="py-3 align-top">Parts</td>
              <EmptyDetailCells />
              <td className={NUMBER_CELL_CLASS}>{formatMoney(invoice.partsPrice)}</td>
            </tr>
          )}
          <tr className="break-inside-avoid border-b">
            <td className="py-3 align-top">
              Labour
              {laborDetail && (
                <span className="mt-0.5 block text-muted-foreground tabular-nums">
                  {laborDetail}
                </span>
              )}
            </td>
            <EmptyDetailCells />
            <td className={NUMBER_CELL_CLASS}>{formatMoney(invoice.laborPrice)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="break-inside-avoid text-base font-bold">
            <th scope="row" className="pt-4 text-left">
              Total
            </th>
            <EmptyDetailCells />
            <td className="pt-4 pl-4 text-right whitespace-nowrap tabular-nums">
              {formatMoney(invoice.totalPrice)}
            </td>
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
