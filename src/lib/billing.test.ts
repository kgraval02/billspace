import { describe, expect, it } from 'vitest'
import {
  calculateInvoiceTotal,
  calculateLineTotal,
  getInvoiceDisplayStatus,
} from './billing'

describe('billing calculations', () => {
  it('calculates a line item total', () => {
    expect(calculateLineTotal(5, 100)).toBe(500)
  })

  it('calculates an invoice total from multiple items', () => {
    expect(
      calculateInvoiceTotal([
        { quantity: 5, unitPrice: 100 },
        { quantity: 1, unitPrice: 50 },
      ]),
    ).toBe(550)
  })
})

describe('invoice status', () => {
  it('marks an unpaid past-due invoice as overdue', () => {
    expect(
      getInvoiceDisplayStatus(
        {
          status: 'sent',
          dueDate: '2026-11-01',
        },
        new Date('2026-11-21T12:00:00'),
      ),
    ).toBe('overdue')
  })

  it('does not mark a paid invoice as overdue', () => {
    expect(
      getInvoiceDisplayStatus(
        {
          status: 'paid',
          dueDate: '2026-11-01',
        },
        new Date('2026-11-21T12:00:00'),
      ),
    ).toBe('paid')
  })

  it('keeps a future invoice in its current state', () => {
    expect(
      getInvoiceDisplayStatus(
        {
          status: 'sent',
          dueDate: '2026-12-01',
        },
        new Date('2026-11-21T12:00:00'),
      ),
    ).toBe('sent')
  })
})

