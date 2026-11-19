import StatusBadge from '@/components/StatusBadge'

function UserEnabledBadge({ enabled }: { enabled: boolean }) {
  return (
    <StatusBadge tone={enabled ? 'success' : 'destructive'}>
      {enabled ? 'Enabled' : 'Disabled'}
    </StatusBadge>
  )
}

export default UserEnabledBadge
