import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StatusTone = 'neutral' | 'success' | 'destructive' | 'primary'

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'border-border bg-muted text-foreground',
  success: 'border-success/30 bg-success/10 text-success-text',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
  primary: 'border-primary/30 bg-primary/10 text-primary-text',
}

interface StatusBadgeProps {
  tone: StatusTone
  children: ReactNode
}

function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  )
}

export default StatusBadge
