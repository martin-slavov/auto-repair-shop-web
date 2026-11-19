import { useEffect, useState } from 'react'
import { getUsers } from '../api/adminUsers'
import type { UserAdmin } from '../types/user'

const PAGE_SIZE = 50

async function loadAllMechanics(onlyEnabled: boolean, signal: AbortSignal): Promise<UserAdmin[]> {
  const mechanics: UserAdmin[] = []
  let page = 0
  for (;;) {
    const result = await getUsers(
      {
        page,
        size: PAGE_SIZE,
        sort: 'username,asc',
        role: 'MECHANIC',
        enabled: onlyEnabled ? true : undefined,
      },
      signal,
    )
    mechanics.push(...result.content)
    page += 1
    if (page >= result.totalPages) return mechanics
  }
}

interface MechanicsState {
  mechanics: UserAdmin[] | null
  error: string | null
}

export function useMechanics(
  enabled: boolean,
  { onlyEnabled }: { onlyEnabled: boolean },
): MechanicsState {
  const [state, setState] = useState<MechanicsState>({ mechanics: null, error: null })

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    loadAllMechanics(onlyEnabled, controller.signal)
      .then((mechanics) => setState({ mechanics, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setState({ mechanics: null, error: message })
      })
    return () => controller.abort()
  }, [enabled, onlyEnabled])

  return state
}
