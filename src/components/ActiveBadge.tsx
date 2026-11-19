import StatusBadge from '@/components/StatusBadge'

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <StatusBadge tone={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</StatusBadge>
  )
}

export default ActiveBadge
