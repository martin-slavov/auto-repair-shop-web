export type RightsRole = 'GUEST' | 'CUSTOMER' | 'MECHANIC' | 'ADMIN'

export type Access = boolean | string

export interface RightsRow {
  capability: string
  access: Record<RightsRole, Access>
}

export interface RightsGroup {
  area: string
  rows: RightsRow[]
}

export const RIGHTS_ROLES: { role: RightsRole; label: string }[] = [
  { role: 'GUEST', label: 'Guest' },
  { role: 'CUSTOMER', label: 'Customer' },
  { role: 'MECHANIC', label: 'Mechanic' },
  { role: 'ADMIN', label: 'Admin' },
]

function access(guest: Access, customer: Access, mechanic: Access, admin: Access) {
  return { GUEST: guest, CUSTOMER: customer, MECHANIC: mechanic, ADMIN: admin }
}

export const RIGHTS: RightsGroup[] = [
  {
    area: 'Account and registration',
    rows: [
      {
        capability: 'Register an account (creates a Customer)',
        access: access(true, false, false, false),
      },
      {
        capability: 'View and edit own profile (email, first and last name)',
        access: access(false, true, true, true),
      },
      { capability: 'Change own password', access: access(false, true, true, true) },
    ],
  },
  {
    area: 'Chat assistant',
    rows: [{ capability: 'Use the chat assistant', access: access(true, true, true, true) }],
  },
  {
    area: 'Services catalog',
    rows: [
      {
        capability: 'View the services catalog',
        access: access('active only', 'active only', 'active only', 'incl. inactive'),
      },
      { capability: 'Add, edit or delete services', access: access(false, false, false, true) },
    ],
  },
  {
    area: 'Parts',
    rows: [
      {
        capability: 'View parts',
        access: access(false, false, 'active only', 'incl. inactive and cost'),
      },
      { capability: 'Add, edit or delete parts', access: access(false, false, false, true) },
    ],
  },
  {
    area: 'Vehicles',
    rows: [
      { capability: 'View vehicles', access: access(false, 'own only', false, true) },
      { capability: 'Add a vehicle', access: access(false, true, false, false) },
      { capability: 'Edit or delete a vehicle', access: access(false, 'own only', false, true) },
    ],
  },
  {
    area: 'Service requests',
    rows: [
      { capability: 'View service requests', access: access(false, 'own only', false, true) },
      {
        capability: 'Create a service request',
        access: access(false, 'own vehicles', false, false),
      },
      {
        capability: 'Edit or delete a pending request',
        access: access(false, 'own only', false, true),
      },
      {
        capability: 'Set a preferred date and time on a request',
        access: access(false, 'pending request', false, 'pending request'),
      },
      { capability: 'Approve or reject a request', access: access(false, false, false, true) },
    ],
  },
  {
    area: 'Service visits',
    rows: [
      { capability: 'View visits', access: access(false, 'own vehicles', 'assigned only', true) },
      {
        capability: 'Reschedule or delete a scheduled visit',
        access: access(false, false, false, true),
      },
      {
        capability: "View a mechanic's free time slots",
        access: access(false, false, false, true),
      },
      {
        capability: 'Add or remove assistant mechanics (up to 3)',
        access: access(false, false, false, 'scheduled or in progress'),
      },
      { capability: 'Start a visit', access: access(false, false, 'assigned only', false) },
      { capability: 'Add parts to a visit', access: access(false, false, 'assigned only', false) },
      {
        capability: 'View, change or remove parts on a visit',
        access: access(false, false, 'assigned only', true),
      },
      { capability: 'Complete a visit', access: access(false, false, 'lead only', false) },
    ],
  },
  {
    area: 'Invoices',
    rows: [
      { capability: 'Create an invoice', access: access(false, false, false, true) },
      {
        capability: 'View invoices and their line items',
        access: access(false, 'own only', false, true),
      },
      { capability: 'Mark an invoice as paid', access: access(false, false, false, true) },
      { capability: 'Delete an unpaid invoice', access: access(false, false, false, true) },
    ],
  },
  {
    area: 'Users',
    rows: [
      { capability: 'View users', access: access(false, false, false, true) },
      {
        capability: 'Create mechanic and admin accounts',
        access: access(false, false, false, true),
      },
      {
        capability: "Edit a user's email and name",
        access: access(false, false, false, true),
      },
      {
        capability: 'Enable or disable users',
        access: access(false, false, false, 'not own account'),
      },
      {
        capability: 'Delete a user',
        access: access(false, false, false, 'not own, no related data'),
      },
    ],
  },
]
