# BillSpace

BillSpace is a lightweight billing and invoicing workspace built with [DeepSpace](https://deep.space/). It allows authenticated users to manage clients, create itemized invoices, track invoice lifecycle states, and monitor billing activity through a dashboard.

**Live App:** https://billspace.app.space

## Features

- DeepSpace authentication
- Client management
  - Create clients
  - Edit client information
  - Delete clients
- Itemized invoice creation
  - Associate invoices with clients
  - Multiple line items
  - Quantity and unit-price calculations
  - Automatic invoice totals
- Invoice lifecycle
  - Draft
  - Sent
  - Paid
  - Derived overdue state for unpaid past-due invoices
- Invoice detail view with individual line items
- Draft invoice deletion with associated line-item cleanup
- Billing dashboard
  - Total invoiced
  - Paid revenue
  - Outstanding balance
  - Client count
  - Recent invoices
- Ownership-aware data access and role-based permissions
- Responsive UI with loading and empty states

## DeepSpace

BillSpace uses DeepSpace as the application platform rather than implementing separate authentication, database, realtime, and authorization infrastructure.

The application uses:

- DeepSpace authentication and authenticated application boundaries
- Collection schemas for application data
- `useQuery` for reactive record access
- `useMutations` for record creation, updates, and deletion
- `userBound` ownership fields
- `ownerField` for record ownership
- Collection-level role-based permissions
- `RecordProvider` and `RecordScope` for the application data layer
- DeepSpace deployment to `app.space`
- DeepSpace test infrastructure and multi-account test accounts

## Data Model

The primary application collections are:

```text
User
 │
 ├── Client
 │    ├── name
 │    ├── company
 │    ├── email
 │    ├── phone
 │    └── address
 │
 └── Invoice
      ├── clientId
      ├── invoiceNumber
      ├── issueDate
      ├── dueDate
      ├── status
      ├── subtotal
      └── total
           │
           └── InvoiceItem
                ├── invoiceId
                ├── description
                ├── quantity
                ├── unitPrice
                └── amount
```

Clients, invoices, and invoice items use authenticated ownership fields and DeepSpace collection permissions.

## Billing Workflow

A typical BillSpace workflow is:

```text
Sign In
   ↓
Add Client
   ↓
Create Invoice
   ↓
Add Line Items
   ↓
Draft
   ↓
Sent
   ↓
Paid
```

An unpaid invoice whose due date has passed is presented as overdue without requiring a scheduled mutation of the stored invoice status.

## Running Locally

### Requirements

- Node.js supported by the DeepSpace SDK
- npm >= 11.6
- A DeepSpace account

Install dependencies:

```bash
npm install
```

Authenticate with DeepSpace:

```bash
npx deepspace auth login
```

Start development:

```bash
npm run dev
```

The application is available locally at:

```text
http://localhost:5173
```

## Testing

Run TypeScript validation:

```bash
npm run type-check
```

Run ESLint:

```bash
npm run lint
```

Run unit tests:

```bash
npm run test:unit
```

Run the complete DeepSpace test suite:

```bash
npx deepspace test run all
```

The project includes tests covering billing calculations and overdue-state logic in addition to DeepSpace smoke, API, collaboration, and prerender tests.

## Production Build

```bash
npm run build
```

## Deployment

BillSpace is deployed using the DeepSpace CLI:

```bash
npx deepspace deploy
```

Production:

https://billspace.app.space

## Design Decisions and Tradeoffs

### Focused billing workflow

The project intentionally focuses on client management, itemized invoicing, invoice lifecycle management, and billing visibility rather than attempting to reproduce a full accounting platform.

### Derived overdue status

Overdue status is derived from the due date and current invoice state rather than persisted as an independent status. This avoids synchronization problems where an invoice could remain stored as `sent` even after its due date passes.

### Separate invoice items

Invoice line items are stored separately and linked to their invoice through `invoiceId`. This keeps invoice data structured and makes individual line items independently queryable.

### No payment processor

BillSpace tracks whether an invoice has been paid but does not process real payments. Integrating a payment processor such as Stripe would introduce checkout, webhook, secret-management, and payment-failure concerns that were outside the focused scope of this exercise.

### No email or PDF integration

Email delivery and PDF generation were intentionally left out because they were not required to demonstrate the core billing workflow or DeepSpace platform primitives.

## Verification

The implementation was verified through:

- TypeScript type checking
- ESLint
- Production builds
- DeepSpace smoke tests
- DeepSpace API tests
- DeepSpace collaboration tests using dedicated test accounts
- Prerender tests
- BillSpace-specific billing calculation tests
- Manual testing of the deployed production workflow

## Known Limitations

- Payments are recorded as invoice lifecycle state rather than processed through a payment provider.
- Tax and discount calculations are not currently included.
- Email invoice delivery and PDF export are not implemented.
- The application uses record ownership and role-based access rather than a full organization/workspace membership model.

## Built With

- DeepSpace SDK
- React
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- Playwright

