import { ArrowLeft } from 'lucide-react'
import { useQuery } from 'deepspace'
import { Badge, Button } from '@/components/ui'
import { Link, useParams } from 'react-router-dom'

interface Invoice {
  invoiceNumber: string
  clientId: string
  clientName: string
  issueDate: string
  dueDate: string
  status: string
  notes?: string
  subtotal: number
  total: number
  ownerId: string
}

interface InvoiceItem {
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  ownerId: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams()

  const { records: invoices, status } =
    useQuery<Invoice>('invoices')

  const { records: invoiceItems } =
    useQuery<InvoiceItem>('invoiceItems')

  const invoice = invoices.find(
    (record) => record.recordId === invoiceId,
  )

  const items = invoiceItems.filter(
    (record) => record.data.invoiceId === invoiceId,
  )

  if (status === 'loading') {
    return (
      <div className="p-8 text-muted-foreground">
        Loading invoice...
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">
          Invoice not found
        </h1>

        <Link
          to="/invoices"
          className="mt-4 inline-block text-sm underline"
        >
          Back to invoices
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link to="/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft aria-hidden="true" />
            Back to Invoices
          </Button>
        </Link>

        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Invoice
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                {invoice.data.invoiceNumber}
              </h1>

              <p className="mt-2 text-muted-foreground">
                {invoice.data.clientName}
              </p>
            </div>

            <Badge
              variant={
                invoice.data.status === 'paid'
                  ? 'success'
                  : 'secondary'
              }
            >
              {invoice.data.status}
            </Badge>
          </div>

          <div className="grid gap-6 border-b border-border p-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Issue Date
              </p>

              <p className="mt-1 font-medium">
                {invoice.data.issueDate}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Due Date
              </p>

              <p className="mt-1 font-medium">
                {invoice.data.dueDate}
              </p>
            </div>
          </div>

          <div className="p-6">
            <h2 className="mb-4 font-semibold">
              Line Items
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No line items found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="py-3">Description</th>
                      <th className="py-3 text-right">
                        Qty
                      </th>
                      <th className="py-3 text-right">
                        Unit Price
                      </th>
                      <th className="py-3 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.recordId}
                        className="border-b border-border"
                      >
                        <td className="py-4">
                          {item.data.description}
                        </td>

                        <td className="py-4 text-right">
                          {item.data.quantity}
                        </td>

                        <td className="py-4 text-right">
                          {formatCurrency(
                            item.data.unitPrice,
                          )}
                        </td>

                        <td className="py-4 text-right font-medium">
                          {formatCurrency(
                            item.data.amount,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between border-t border-border pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(invoice.data.total)}
                  </span>
                </div>
              </div>
            </div>

            {invoice.data.notes && (
              <div className="mt-8">
                <p className="text-sm font-medium">
                  Notes
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {invoice.data.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

