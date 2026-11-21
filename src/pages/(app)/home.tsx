import { FileText, Users, CircleDollarSign, Clock } from 'lucide-react'
import { useQuery } from 'deepspace'
import { Badge } from '@/components/ui'

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

interface Client {
  name: string
  company?: string
  email?: string
  ownerId: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function HomePage() {
  const { records: invoices, status } = useQuery<Invoice>('invoices', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })

  const { records: clients } = useQuery<Client>('clients', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })

  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.data.total || 0),
    0,
  )

  const paidRevenue = invoices
    .filter((invoice) => invoice.data.status === 'paid')
    .reduce(
      (sum, invoice) => sum + Number(invoice.data.total || 0),
      0,
    )

  const outstanding = invoices
    .filter((invoice) => invoice.data.status !== 'paid')
    .reduce(
      (sum, invoice) => sum + Number(invoice.data.total || 0),
      0,
    )

  const recentInvoices = invoices.slice(0, 5)

  const isLoading = status === 'loading'

  const cards = [
    {
      label: 'Total Invoiced',
      value: formatCurrency(totalInvoiced),
      icon: FileText,
    },
    {
      label: 'Paid Revenue',
      value: formatCurrency(paidRevenue),
      icon: CircleDollarSign,
    },
    {
      label: 'Outstanding',
      value: formatCurrency(outstanding),
      icon: Clock,
    },
    {
      label: 'Clients',
      value: clients.length.toString(),
      icon: Users,
    },
  ]

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground">
            BillSpace Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor invoices, payments, and outstanding revenue.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {card.label}
                  </p>

                  <Icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-3 text-2xl font-bold text-foreground">
                  {isLoading ? '—' : card.value}
                </p>
              </div>
            )
          })}
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">
              Recent Invoices
            </h2>
          </div>

          {isLoading ? (
            <div className="p-5 text-sm text-muted-foreground">
              Loading invoices...
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No invoices yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr
                      key={invoice.recordId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-4 font-medium">
                        {invoice.data.invoiceNumber}
                      </td>

                      <td className="px-5 py-4">
                        {invoice.data.clientName}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {formatCurrency(invoice.data.total)}
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            invoice.data.status === 'paid'
                              ? 'success'
                              : 'secondary'
                          }
                        >
                          {invoice.data.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}