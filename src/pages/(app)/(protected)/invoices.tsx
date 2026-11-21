import { FileText, Plus } from 'lucide-react'
import { useState } from 'react'
import { useMutations, useQuery, useUser } from 'deepspace'
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
} from '@/components/ui'

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

interface InvoiceItem {
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  ownerId: string
}

interface LineItemForm {
  description: string
  quantity: string
  unitPrice: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function InvoicesPage() {
  const { user } = useUser()

  const [showCreate, setShowCreate] = useState(false)
  const [clientId, setClientId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    {
      description: '',
      quantity: '1',
      unitPrice: '',
    },
  ])
  const [creating, setCreating] = useState(false)

  const { records: clients } = useQuery<Client>('clients', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })

  const { records: invoices, status } = useQuery<Invoice>('invoices', {
    orderBy: 'createdAt',
    orderDir: 'desc',
  })

  const {
    createConfirmed: createInvoice,
    putConfirmed: updateInvoice,
  } = useMutations<Invoice>('invoices')

  const { createConfirmed: createInvoiceItem } =
  useMutations<InvoiceItem>('invoiceItems')

  const total = lineItems.reduce((sum, item) => {
  const quantity = Number(item.quantity) || 0
  const unitPrice = Number(item.unitPrice) || 0

    return sum + quantity * unitPrice
  }, 0)

  const updateLineItem = (
    index: number,
    field: keyof LineItemForm,
    value: string,
  ) => {
    setLineItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item,
      ),
    )
  }

  const addLineItem = () => {
    setLineItems((current) => [
      ...current,
      {
        description: '',
        quantity: '1',
        unitPrice: '',
      },
    ])
  }

  const removeLineItem = (index: number) => {
    setLineItems((current) => {
      if (current.length === 1) return current

      return current.filter(
        (_, itemIndex) => itemIndex !== index,
      )
    })
  }

  const handleCreate = async () => {
    if (!user || creating) return

    const client = clients.find(
      (candidate) => candidate.recordId === clientId,
    )

    const validItems = lineItems.filter(
      (item) =>
        item.description.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) >= 0,
    )

    if (!client || !dueDate || validItems.length === 0 || total <= 0) {
      return
    }

    setCreating(true)

    try {
      const invoiceNumber =
        `INV-${Date.now().toString().slice(-6)}`

      const invoiceId = await createInvoice({
        invoiceNumber,
        clientId: client.recordId,
        clientName: client.data.name,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate,
        status: 'draft',
        notes: '',
        subtotal: total,
        total,
        ownerId: user.id,
      })

      await Promise.all(
        validItems.map((item) => {
          const quantity = Number(item.quantity)
          const unitPrice = Number(item.unitPrice)

          return createInvoiceItem({
            invoiceId,
            description: item.description.trim(),
            quantity,
            unitPrice,
            amount: quantity * unitPrice,
            ownerId: user.id,
          })
        }),
      )

      setClientId('')
      setDueDate('')
      setLineItems([
        {
          description: '',
          quantity: '1',
          unitPrice: '',
        },
      ])

      setShowCreate(false)
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (
    invoiceId: string,
    newStatus: 'sent' | 'paid',
  ) => {
    try {
      await updateInvoice(invoiceId, {
        status: newStatus,
      })
    } catch (error) {
      console.error('Failed to update invoice status:', error)
    }
  }

  const isLoading = status === 'loading'

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Invoices
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Create invoices and track their billing status.
              </p>
            </div>

            <Button
              onClick={() => setShowCreate(true)}
              disabled={clients.length === 0}
            >
              <Plus aria-hidden="true" />
              New Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-20 animate-pulse rounded-xl bg-muted/40" />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Create your first invoice to start tracking billing."
            icon={<FileText aria-hidden="true" />}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.recordId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-4 font-medium">
                        {invoice.data.invoiceNumber}
                      </td>

                      <td className="px-4 py-4">
                        {invoice.data.clientName}
                      </td>

                      <td className="px-4 py-4">
                        {invoice.data.dueDate}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {formatCurrency(invoice.data.total)}
                      </td>

                      <td className="px-4 py-4">
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

                      <td className="px-4 py-4">
                        {invoice.data.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              void handleStatusChange(
                                invoice.recordId,
                                'sent',
                              )
                            }
                          >
                            Mark Sent
                          </Button>
                        )}

                        {invoice.data.status === 'sent' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              void handleStatusChange(
                                invoice.recordId,
                                'paid',
                              )
                            }
                          >
                            Mark Paid
                          </Button>
                        )}

                        {invoice.data.status === 'paid' && (
                          <span className="text-sm text-muted-foreground">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        size="sm"
      >
        <Modal.Header>
          <Modal.Title>Create Invoice</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoice-client" className="mb-2 block">
                Client
              </Label>

              <select
                id="invoice-client"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Select client</option>

                {clients.map((client) => (
                  <option
                    key={client.recordId}
                    value={client.recordId}
                  >
                    {client.data.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="due-date" className="mb-2 block">
                Due Date
              </Label>

              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label>Line Items</Label>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addLineItem}
                >
                  <Plus aria-hidden="true" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="space-y-3">
                      <div>
                        <Label className="mb-1 block">
                          Description
                        </Label>

                        <Input
                          value={item.description}
                          onChange={(event) =>
                            updateLineItem(
                              index,
                              'description',
                              event.target.value,
                            )
                          }
                          placeholder="Web development"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="mb-1 block">
                            Quantity
                          </Label>

                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateLineItem(
                                index,
                                'quantity',
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label className="mb-1 block">
                            Unit Price
                          </Label>

                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(event) =>
                              updateLineItem(
                                index,
                                'unitPrice',
                                event.target.value,
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Line total
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {formatCurrency(
                              (Number(item.quantity) || 0) *
                                (Number(item.unitPrice) || 0),
                            )}
                          </span>

                          {lineItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-semibold">
                  Invoice Total
                </span>

                <span className="text-xl font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCreate(false)}
            disabled={creating}
          >
            Cancel
          </Button>

          <Button
            onClick={() => void handleCreate()}
            loading={creating}
            disabled={!clientId || !dueDate ||  total <= 0 ||  !lineItems.some(
                  (item) => item.description.trim() &&
                            Number(item.quantity) > 0 &&
                            Number(item.unitPrice) >= 0,)
            }
          >
            Create Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}