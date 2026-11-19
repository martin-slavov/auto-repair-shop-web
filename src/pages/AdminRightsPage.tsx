import { Check, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RIGHTS, RIGHTS_ROLES, type Access } from '@/lib/rights'

function AccessCell({ access }: { access: Access }) {
  if (access === false) {
    return (
      <>
        <Minus aria-hidden="true" className="inline size-4 text-muted-foreground" />
        <span className="sr-only">Not allowed</span>
      </>
    )
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Check aria-hidden="true" className="size-4 text-success" />
      {access === true ? (
        <span className="sr-only">Allowed</span>
      ) : (
        <span className="text-xs text-muted-foreground">
          <span className="sr-only">Allowed: </span>
          {access}
        </span>
      )}
    </div>
  )
}

function AdminRightsPage() {
  return (
    <>
      <h1>Rights</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        What each role can do in the system. Roles never change on an existing account.
        Registration always creates a Customer account; mechanic and admin accounts are created by
        an admin.
      </p>

      <Card>
        <CardContent>
          <Table>
            <caption className="sr-only">Rights per role, grouped by area</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="w-full">
                  Capability
                </TableHead>
                {RIGHTS_ROLES.map(({ role, label }) => (
                  <TableHead key={role} scope="col" className="min-w-24 text-center">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {RIGHTS.map((group) => (
              <TableBody key={group.area}>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead
                    scope="rowgroup"
                    colSpan={RIGHTS_ROLES.length + 1}
                    className="text-xs tracking-wide text-muted-foreground uppercase"
                  >
                    {group.area}
                  </TableHead>
                </TableRow>
                {group.rows.map((row) => (
                  <TableRow key={row.capability}>
                    <TableHead scope="row" className="font-normal whitespace-normal">
                      {row.capability}
                    </TableHead>
                    {RIGHTS_ROLES.map(({ role }) => (
                      <TableCell key={role} className="text-center whitespace-normal">
                        <AccessCell access={row.access[role]} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

export default AdminRightsPage
