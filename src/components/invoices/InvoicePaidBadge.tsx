import StatusBadge from '@/components/StatusBadge'

function InvoicePaidBadge({ paid }: { paid: boolean }) {
  return (
    <StatusBadge tone={paid ? 'success' : 'destructive'}>{paid ? 'Paid' : 'Unpaid'}</StatusBadge>
  )
}

export default InvoicePaidBadge
