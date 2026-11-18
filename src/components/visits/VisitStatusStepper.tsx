import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SERVICE_VISIT_STATUS_LABELS,
  SERVICE_VISIT_STATUS_ORDER,
  type ServiceVisitStatus,
} from '../../types/serviceVisit'

type StepState = 'done' | 'current' | 'upcoming'

const CIRCLE_CLASSES: Record<StepState, string> = {
  done: 'border-success bg-success text-background',
  current: 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
  upcoming: 'border-border bg-background text-muted-foreground',
}

const LABEL_CLASSES: Record<StepState, string> = {
  done: 'text-foreground',
  current: 'font-semibold text-foreground',
  upcoming: 'text-muted-foreground',
}

const SR_SUFFIX: Record<StepState, string> = {
  done: ' (done)',
  current: ' (current)',
  upcoming: '',
}

function VisitStatusStepper({ status }: { status: ServiceVisitStatus }) {
  const currentIndex = SERVICE_VISIT_STATUS_ORDER.indexOf(status)
  const lastIndex = SERVICE_VISIT_STATUS_ORDER.length - 1

  return (
    <ol aria-label="Visit progress" className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {SERVICE_VISIT_STATUS_ORDER.map((step, index) => {
        const state: StepState =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li
            key={step}
            aria-current={state === 'current' ? 'step' : undefined}
            className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center"
          >
            {index < lastIndex && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-7 left-3.5 h-3 w-0.5 -translate-x-1/2',
                  'sm:top-3.5 sm:left-[calc(50%+1.125rem)] sm:h-0.5 sm:w-[calc(100%-2.25rem)] sm:translate-x-0 sm:-translate-y-1/2',
                  index < currentIndex ? 'bg-success' : 'bg-border',
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                CIRCLE_CLASSES[state],
              )}
            >
              {state === 'done' ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn('text-sm', LABEL_CLASSES[state])}>
              {SERVICE_VISIT_STATUS_LABELS[step]}
              <span className="sr-only">{SR_SUFFIX[state]}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default VisitStatusStepper
