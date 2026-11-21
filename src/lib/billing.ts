export interface BillingLineItem {
  quantity: number
  unitPrice: number
}

export interface BillingStatusInput {
  status: string
  dueDate: string
}

export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
): number {
  return quantity * unitPrice
}

export function calculateInvoiceTotal(
  items: BillingLineItem[],
): number {
  return items.reduce(
    (total, item) =>
      total +
      calculateLineTotal(
        item.quantity,
        item.unitPrice,
      ),
    0,
  )
}

export function getInvoiceDisplayStatus(
  invoice: BillingStatusInput,
  now = new Date(),
): string {
  if (
    invoice.status !== 'paid' &&
    invoice.dueDate &&
    new Date(`${invoice.dueDate}T23:59:59`) < now
  ) {
    return 'overdue'
  }

  return invoice.status
}

