import type { CollectionSchema } from 'deepspace/schema'

export const clientsSchema: CollectionSchema = {
  name: 'clients',
  columns: [
    {
      name: 'name',
      storage: 'text',
      interpretation: 'plain',
      required: true,
    },
    {
      name: 'company',
      storage: 'text',
      interpretation: 'plain',
    },
    {
      name: 'email',
      storage: 'text',
      interpretation: 'plain',
    },
    {
      name: 'phone',
      storage: 'text',
      interpretation: 'plain',
    },
    {
      name: 'address',
      storage: 'text',
      interpretation: 'plain',
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
    viewer: {
      read: false,
      create: false,
      update: false,
      delete: false,
    },
    member: {
      read: true,
      create: true,
      update: 'own',
      delete: 'own',
    },
    admin: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
  },
}

