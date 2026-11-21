/**
 * Collection Schemas
 *
 * All collections with columns and RBAC permissions.
 * Single source of truth — imported by both worker and frontend.
 *
 * Add schemas by creating a file in src/schemas/ and importing it here.
 */

import type { CollectionSchema } from 'deepspace/schema'
import { usersSchema } from './schemas/users-schema'
import { settingsSchema } from './schemas/admin-schema'
import { clientsSchema } from './schemas/clients-schema'
import { itemsSchema } from './schemas/items-schema'
import {
  invoicesSchema,
  invoiceItemsSchema,
} from './schemas/invoices-schema'

export const schemas: CollectionSchema[] = [
  clientsSchema,
  invoicesSchema,
  invoiceItemsSchema,
  itemsSchema,
  usersSchema,
  settingsSchema,
]

