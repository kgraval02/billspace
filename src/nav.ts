/**
 * Navigation Config
 *
 * Add one entry per nav item. Routes are handled by generouted
 * (file-based routing in src/pages/), this just controls what
 * appears in the navigation bar.
 */

import type { Role } from './constants'

export interface NavItem {
  path: string
  label: string
  roles?: Role[]
  devOnly?: boolean
}

export const nav: NavItem[] = [
  { path: '/home', label: 'Home' },
  { path: '/settings', label: 'Settings' },
  { path: '/items', label: 'Items', roles: ['member' as Role] },
  { path: '/clients', label: 'Clients', roles: ['member' as Role] },
  { path: '/invoices', label: 'Invoices', roles: ['member' as Role] },

]
