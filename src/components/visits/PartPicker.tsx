import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getParts } from '../../api/parts'
import { formatMoney } from '../../lib/money'
import type { PartCatalog } from '../../types/part'

const SEARCH_DEBOUNCE_MS = 250
const RESULT_LIMIT = 10

interface SearchResult {
  name: string
  parts: PartCatalog[] | null
  error: string | null
}

interface PartPickerProps {
  id: string
  selected: PartCatalog | null
  onSelect: (part: PartCatalog) => void
  error?: string
  disabled?: boolean
}

function PartPicker({ id, selected, onSelect, error, disabled }: PartPickerProps) {
  const [name, setName] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      getParts({ name, size: RESULT_LIMIT, sort: 'name,asc' }, controller.signal)
        .then((page) => setResult({ name, parts: page.content, error: null }))
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          const message = err instanceof Error ? err.message : 'Something went wrong'
          setResult({ name, parts: null, error: message })
        })
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [name])

  const loading = result === null || result.name !== name
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Part</Label>
      <Input
        id={id}
        type="search"
        placeholder="Search parts by name"
        value={name}
        disabled={disabled}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault()
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <div
        role="listbox"
        aria-label="Matching parts"
        className="flex h-48 flex-col overflow-y-auto rounded-lg border"
      >
        {result?.error ? (
          <p className="px-3 py-2 text-sm text-destructive">
            Could not load parts: {result.error}
          </p>
        ) : result?.parts && result.parts.length === 0 && !loading ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">No active parts match.</p>
        ) : result?.parts ? (
          result.parts.map((part) => {
            const isSelected = selected?.id === part.id
            return (
              <button
                key={part.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={disabled}
                onClick={() => onSelect(part)}
                className={cn(
                  'flex items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted disabled:pointer-events-none disabled:opacity-50',
                  isSelected && 'bg-primary/10 font-medium hover:bg-primary/15',
                )}
              >
                <span className="min-w-0">
                  <span className="block wrap-anywhere">{part.name}</span>
                  <span className="block text-xs text-muted-foreground wrap-anywhere">
                    {part.serialNumber}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{formatMoney(part.unitSellPrice)}</span>
              </button>
            )
          })
        ) : (
          <p className="px-3 py-2 text-sm text-muted-foreground">Loading parts…</p>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export default PartPicker
