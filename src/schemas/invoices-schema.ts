import type { CollectionSchema } from 'deepspace/schema'

export const invoicesSchema: CollectionSchema = {
  name: 'invoices',
  columns: [
    {
      name: 'invoiceNumber',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'clientId',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'clientName',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'issueDate',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'dueDate',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'status',
      storage: 'text',
      interpretation: {
        kind: 'select',
        options: ['draft', 'sent', 'paid'],
      },
      default: 'draft',
    },
    {
      name: 'notes',
      storage: 'text',
      interpretation: 'plain',
    },
    {
      name: 'subtotal',
      storage: 'number',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'total',
      storage: 'number',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'ownerId',
      storage: 'text',
      interpretation: 'plain',
      required: true,
      userBound: true,
      immutable: true,
    },
  ],
  ownerField: 'ownerId',
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own' },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const invoiceItemsSchema: CollectionSchema = {
  name: 'invoiceItems',
  columns: [
    {
      name: 'invoiceId',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'description',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'quantity',
      storage: 'number',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'unitPrice',
      storage: 'number',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'amount',
      storage: 'number',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'ownerId',
      storage: 'text',
      interpretation: 'plain',
      required: true,
      userBound: true,
      immutable: true,
    },
  ],
  ownerField: 'ownerId',
  permissions: {
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own' },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

