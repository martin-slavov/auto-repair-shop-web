import StatusBadge, { type StatusTone } from '@/components/StatusBadge'
import type { Role } from '../../types/auth'
import { USER_ROLE_LABELS } from '../../types/user'

const ROLE_TONES: Record<Role, StatusTone> = {
  ADMIN: 'primary',
  MECHANIC: 'success',
  CUSTOMER: 'neutral',
}

function UserRoleBadge({ role }: { role: Role }) {
  return <StatusBadge tone={ROLE_TONES[role]}>{USER_ROLE_LABELS[role]}</StatusBadge>
}

export default UserRoleBadge
