# Auto Repair Shop – Web

A React + TypeScript frontend for the [auto-repair-shop-api](https://github.com/martin-slavov/auto-repair-shop-api)
Spring Boot API. Customers register their vehicles and request services, admins approve requests and plan
visits, mechanics carry out the work and record the parts used, and the shop issues itemised invoices.
All data and all permission checks come from the API; this app is the user interface on top of it.

## Tech stack

- React 19 and TypeScript
- Vite 8 (dev server and build)
- React Router 7
- Tailwind CSS 4 with shadcn/ui components on Base UI
- lucide-react icons
- ESLint (typescript-eslint, react-hooks, react-refresh)

## Features by role

**Guest**

- Home page with a preview of the services
- Services catalog with name and price filters, sorting and pagination
- Register (always creates a Customer account) and log in

**Customer**

- Vehicles: add, edit and delete own vehicles, with filters
- Service requests: create a request for an own vehicle, edit or delete it while it is pending
- Visits: see the visits for own vehicles and their details
- Invoices: list own invoices with filters and open a printable, itemised invoice (parts and labour)

**Mechanic**

- Visits: see the visits they are assigned to
- Start a visit, add, change and remove parts on it, and complete it (lead mechanic only)

**Admin**

- Vehicles: see, edit and delete all vehicles
- Service requests: see all requests, approve (assign mechanics and a date) or reject them
- Visits: see all visits with filters, reschedule or delete scheduled visits, view parts, create the invoice
- Invoices: list all invoices with filters, mark as paid, delete unpaid invoices, open the printable invoice
- Admin area:
  - Users: create mechanic and admin accounts, enable or disable users
  - Catalog: add, edit, delete and hide services
  - Parts: add, edit, delete and hide parts
  - Rights: an overview of what each role can do

## Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Everyone |
| `/services` | Services catalog | Everyone |
| `/login` | Log in | Everyone |
| `/register` | Register | Everyone |
| `/vehicles` | Vehicles | Customer, Admin |
| `/service-requests` | Service requests | Customer, Admin |
| `/visits` | Visits (view depends on the role) | Customer, Mechanic, Admin |
| `/invoices` | Invoices (view depends on the role) | Customer, Admin |
| `/invoices/:id` | Printable invoice | Customer (own), Admin |
| `/admin` | Redirects to `/admin/users` | Admin |
| `/admin/users` | Users | Admin |
| `/admin/catalog` | Services catalog management | Admin |
| `/admin/parts` | Parts | Admin |
| `/admin/rights` | Rights overview | Admin |
| any other path | Page not found | Everyone |

A visitor who is not logged in is sent to `/login` from a protected route. A logged-in user with the wrong role
sees an "Access denied" page.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8) and npm
- The [auto-repair-shop-api](https://github.com/martin-slavov/auto-repair-shop-api) backend running, by default
  on `http://localhost:8080`

## Setup

```bash
git clone https://github.com/martin-slavov/auto-repair-shop-web.git
cd auto-repair-shop-web
npm install
cp .env.example .env
```

Set the API address in `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

Start the dev server and open http://localhost:5173:

```bash
npm run dev
```

### Backend CORS

The API only accepts browser requests from allowed origins. Make sure the backend's
`APP_CORS_ALLOWED_ORIGINS` setting includes the dev origin `http://localhost:5173`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot reload on http://localhost:5173 |
| `npm run build` | Type-checks the project (`tsc -b`) and builds the production files into `dist/` |
| `npm run lint` | Runs ESLint on the whole project |
| `npm run preview` | Serves the built `dist/` folder locally to check the production build |

## Project structure

```
src/
├── api/                   API client (fetch wrapper, token, errors) and one module per resource
├── auth/                  Auth context and provider, JWT decoding, token storage
├── components/            Layout, route guard and shared components, grouped in folders:
│   ├── ui/                shadcn/ui base components (button, card, dialog, input, label, table)
│   ├── data-table/        Table, card list, sort control and pagination
│   ├── admin/             Admin area sub-navigation
│   ├── catalog/           Admin services table and service form
│   ├── home/              Home page sections
│   ├── invoices/          Invoice table, admin invoices view, printable invoice
│   ├── parts/             Admin parts table and part form
│   ├── service-requests/  Request table, cards, form, approve dialog, status badge
│   ├── users/             Users table, create user dialog, badges
│   ├── vehicles/          Vehicle table, cards and form
│   └── visits/            Visit views, tables, cards, dialogs, part picker, status
├── hooks/                 Reusable hooks (table state, range filters, document title, data loading)
├── lib/                   Helpers (dates, money, decimals, passwords, field classes, rights data)
├── pages/                 One component per route
├── types/                 TypeScript types matching the API DTOs
├── App.tsx                Route definitions with role guards
├── index.css              Tailwind setup, theme tokens and fonts
└── main.tsx               Entry point: router and auth provider
```

<details>
<summary>Full file tree</summary>

```
src/
├── api/
│   ├── adminUsers.ts                        List, create, enable and disable users
│   ├── auth.ts                              Login and register requests
│   ├── catalog.ts                           Service catalog requests
│   ├── client.ts                            Fetch wrapper: token, errors, query strings
│   ├── invoices.ts                          List, view, pay and delete invoices
│   ├── parts.ts                             Public and admin parts requests
│   ├── serviceRequests.ts                   Request CRUD, approve and reject
│   ├── serviceVisits.ts                     Visit actions and visit parts
│   └── vehicles.ts                          Vehicle CRUD requests
├── auth/
│   ├── AuthContext.ts                       Auth context and its type
│   ├── AuthProvider.tsx                     Login, logout and session expiry
│   ├── jwt.ts                               Reads username, role, expiry from JWT
│   ├── tokenStorage.ts                      Stores the token in localStorage
│   └── useAuth.ts                           Hook to read the auth context
├── components/
│   ├── ActiveBadge.tsx                      Active / Inactive badge
│   ├── ActiveField.tsx                      "Active" checkbox with hint
│   ├── ConfirmActionDialog.tsx              Confirm dialog with error handling
│   ├── ConfirmDeleteDialog.tsx              Confirm dialog preset for deleting
│   ├── FormField.tsx                        Label, field, hint and error
│   ├── Layout.tsx                           Header, role-based navigation, mobile menu
│   ├── PageContainer.tsx                    Centred page width wrapper
│   ├── RequireRole.tsx                      Route guard by user role
│   ├── StatusBadge.tsx                      Base coloured badge with tones
│   ├── ui/
│   │   ├── button.tsx                       Button and its variants
│   │   ├── card.tsx                         Card and its sections
│   │   ├── dialog.tsx                       Modal dialog parts
│   │   ├── input.tsx                        Text input
│   │   ├── label.tsx                        Form label
│   │   └── table.tsx                        Table elements
│   ├── data-table/
│   │   ├── DataCardList.tsx                 Card list with loading and errors
│   │   ├── DataTable.tsx                    Sortable table with loading states
│   │   ├── SortControl.tsx                  Sort dropdown for card lists
│   │   └── TablePagination.tsx              Page buttons, rows per page, total
│   │
│   ├── admin/
│   │   └── AdminLayout.tsx                  Admin sub-navigation
│   ├── catalog/
│   │   ├── AdminCatalogTable.tsx            Admin services table with actions
│   │   └── CatalogItemFormDialog.tsx        Add or edit a service
│   ├── home/
│   │   ├── CallToAction.tsx                 "View services" banner
│   │   ├── FeaturesSection.tsx              "Why choose us" feature list
│   │   ├── HeroSection.tsx                  Hero banner with main links
│   │   └── ServicesPreview.tsx              Preview of catalog services
│   ├── invoices/
│   │   ├── AdminInvoicesView.tsx            Admin invoice list, filters, actions
│   │   ├── InvoiceDocument.tsx              Printable itemised invoice layout
│   │   ├── InvoicePaidBadge.tsx             Paid / Unpaid badge
│   │   └── InvoiceTable.tsx                 Invoice table for customer or admin
│   ├── parts/
│   │   ├── PartFormDialog.tsx               Add or edit a part
│   │   └── PartTable.tsx                    Admin parts table with actions
│   ├── service-requests/
│   │   ├── ApproveServiceRequestDialog.tsx  Approve: assign mechanics and date
│   │   ├── ServiceRequestCard.tsx           Customer's service request card
│   │   ├── ServiceRequestFormDialog.tsx     Create or edit a request
│   │   ├── ServiceRequestStatusBadge.tsx    Request status badge
│   │   └── ServiceRequestTable.tsx          Admin requests table with actions
│   ├── users/
│   │   ├── CreateUserDialog.tsx             Create a mechanic or admin
│   │   ├── UserEnabledBadge.tsx             Enabled / Disabled badge
│   │   ├── UserRoleBadge.tsx                User role badge
│   │   └── UserTable.tsx                    Users table with enable toggle
│   ├── vehicles/
│   │   ├── VehicleCard.tsx                  Customer's vehicle card
│   │   ├── VehicleCardGrid.tsx              Grid of vehicle cards
│   │   ├── VehicleFormDialog.tsx            Add or edit a vehicle
│   │   └── VehicleTable.tsx                 Admin vehicles table with actions
│   └── visits/
│       ├── AdminVisitsView.tsx              Admin visit list, filters, actions
│       ├── CompleteVisitDialog.tsx          Complete: technical notes, hours worked
│       ├── MechanicVisitsView.tsx           Mechanic's assigned visits and actions
│       ├── MechanicVisitTable.tsx           Mechanic visits table with actions
│       ├── PartPicker.tsx                   Search-as-you-type part selector
│       ├── RescheduleVisitDialog.tsx        Change a visit's scheduled date
│       ├── VisitCard.tsx                    Customer's visit card with progress
│       ├── visitColumns.tsx                 Shared visit table columns
│       ├── VisitDetailsDialog.tsx           Visit details, mechanics and parts
│       ├── VisitPartsDialog.tsx             Add, change and remove parts
│       ├── VisitStatusBadge.tsx             Visit status badge
│       ├── VisitStatusStepper.tsx           Visit progress steps
│       └── VisitTable.tsx                   Admin visits table with actions
├── hooks/
│   ├── useCustomerVehicles.ts               Loads all vehicles for selection
│   ├── useDataTable.ts                      Paging, sorting, filters and loading
│   ├── useDocumentTitle.ts                  Sets the browser tab title
│   ├── useMechanics.ts                      Loads all mechanic accounts
│   ├── useRangeFilter.ts                    From/to filter with validation
│   └── useVisitParts.ts                     Loads and reloads a visit's parts
├── lib/
│   ├── date.ts                              Today, now and date formatting
│   ├── decimal.ts                           Validates price and hours inputs
│   ├── fieldClasses.ts                      Classes for selects and textareas
│   ├── fieldErrorProps.ts                   ARIA attributes for field errors
│   ├── money.ts                             Formats amounts with two decimals
│   ├── password.ts                          Password length and match check
│   ├── rights.ts                            Data for the rights overview
│   └── utils.ts                             Re-exports the cn class helper
├── pages/
│   ├── AdminCatalogPage.tsx                 Admin services management
│   ├── AdminPartsPage.tsx                   Admin parts management
│   ├── AdminRightsPage.tsx                  Role rights overview table
│   ├── AdminUsersPage.tsx                   Admin users management
│   ├── CatalogPage.tsx                      Public services catalog
│   ├── ForbiddenPage.tsx                    "Access denied" page
│   ├── HomePage.tsx                         Home page sections
│   ├── InvoicesPage.tsx                     Invoices: customer or admin view
│   ├── InvoiceViewPage.tsx                  One printable invoice
│   ├── LoginPage.tsx                        Login form, session-expired notice
│   ├── NotFoundPage.tsx                     "Page not found" page
│   ├── RegisterPage.tsx                     Customer registration form
│   ├── ServiceRequestsPage.tsx              Service requests: customer or admin
│   ├── VehiclesPage.tsx                     Vehicles: customer or admin view
│   └── VisitsPage.tsx                       Visits: customer, mechanic or admin
├── types/
│   ├── api.ts                               Paging, sorting and error types
│   ├── auth.ts                              Roles, auth user, login, register
│   ├── catalog.ts                           Service catalog types and query
│   ├── invoice.ts                           Invoice, part line and query
│   ├── part.ts                              Part types and queries
│   ├── serviceRequest.ts                    Request types, labels and query
│   ├── serviceVisit.ts                      Visit, mechanic and part types
│   ├── user.ts                              Admin user types and role labels
│   └── vehicle.ts                           Vehicle types and query
├── App.tsx                                  Routes with role guards
├── index.css                                Tailwind setup, theme tokens, fonts
└── main.tsx                                 Entry: router and auth provider
```

</details>

### How the layers connect

Pages are the route components: they use the hooks for table state, filters and data loading, and build their
screens from the shared and feature components. Pages, hooks and the larger components (form dialogs, role
views, the part picker) call the functions in `api/`, one module per resource, and all of them go through
`api/client.ts`, which adds the `Authorization: Bearer` token, turns error responses into an `ApiError` and
reports a `401` on a logged-in request so the session ends. The `auth/` provider holds the current user, read
from the stored JWT, and gives it to the layout, the route guard and the pages through `useAuth`. The `types/`
folder describes the data the API sends and receives, so every layer works with the same shapes.

## Authentication

- Logging in calls `POST /api/auth/login`, which returns a JWT. The token is stored in `localStorage` and sent
  as `Authorization: Bearer <token>` with every API request.
- The token is decoded in the browser only to adapt the UI (username, role and expiry time). It is not
  verified on the client; the server checks the token and the permissions on every request.
- The user is logged out automatically when the API answers `401` for a request with a token, and when the
  token's expiry time is reached. In both cases the login page shows "Your session has expired" and, after
  logging in again, returns to the page the user was on.
- A normal logout removes the token, and the next login starts on the home page.

## Deployment notes

- `npm run build` produces static files in `dist/` that any static web server or hosting service can serve.
- The app uses client-side routing, so the server needs an SPA fallback: every path that is not a file must
  return `index.html` (`npm run preview` already does this). For example, with nginx:

  ```nginx
  location / {
    try_files $uri /index.html;
  }
  ```

- `VITE_API_BASE_URL` is read at build time and written into the JavaScript bundle. Set it before building,
  and rebuild when the API address changes.
- Add the production origin of the frontend to the backend's `APP_CORS_ALLOWED_ORIGINS`.
## Backend

The API for this frontend: [martin-slavov/auto-repair-shop-api](https://github.com/martin-slavov/auto-repair-shop-api)