import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const sampleServices = [
  { name: 'Oil change', price: '49.00', hours: '0.50' },
  { name: 'Brake pads (front)', price: '120.00', hours: '1.50' },
  { name: 'Annual inspection', price: '80.00', hours: '1.00' },
]

function UiPreviewPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-2">
        <h1>Heading 1 – Auto Repair Shop</h1>
        <h2>Heading 2 – Our services</h2>
        <h3>Heading 3 – Brakes and tyres</h3>
        <p>Body text in Inter. Fast, honest repairs for every car.</p>
        <p className="text-muted-foreground">Muted text for hints and secondary information.</p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button>Primary button</Button>
        <Button variant="secondary">Secondary button</Button>
        <Button variant="outline">Outline button</Button>
        <Button disabled>Disabled</Button>
      </section>

      <section className="flex max-w-sm flex-col gap-2">
        <Label htmlFor="preview-email">Email</Label>
        <Input id="preview-email" type="email" placeholder="you@example.com" />
      </section>

      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Full service</CardTitle>
          <CardDescription>Oil, filters, brakes and a full check.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>From 199.00</p>
        </CardContent>
        <CardFooter>
          <Button>Book now</Button>
        </CardFooter>
      </Card>

      <section className="bg-muted p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Est. hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleServices.map((service) => (
              <TableRow key={service.name}>
                <TableCell>{service.name}</TableCell>
                <TableCell className="text-right">{service.price}</TableCell>
                <TableCell className="text-right">{service.hours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

export default UiPreviewPage
