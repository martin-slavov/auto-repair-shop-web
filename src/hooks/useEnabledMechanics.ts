import { useEffect, useState } from 'react'
import { getUsers } from '../api/adminUsers'
import type { UserAdmin } from '../types/user'

const PAGE_SIZE = 50

async function loadAllEnabledMechanics(signal: AbortSignal): Promise<UserAdmin[]> {
  const mechanics: UserAdmin[] = []
  let page = 0
  for (;;) {
    const result = await getUsers(
      { page, size: PAGE_SIZE, sort: 'username,asc', role: 'MECHANIC', enabled: true },
      signal,
    )
    mechanics.push(...result.content)
    page += 1
    if (page >= result.totalPages) return mechanics
  }
}

interface EnabledMechanicsState {
  mechanics: UserAdmin[] | null
  error: string | null
}

export function useEnabledMechanics(enabled: boolean): EnabledMechanicsState {
  const [state, setState] = useState<EnabledMechanicsState>({ mechanics: null, error: null })

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    loadAllEnabledMechanics(controller.signal)
      .then((mechanics) => setState({ mechanics, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setState({ mechanics: null, error: message })
      })
    return () => controller.abort()
  }, [enabled])

  return state
}
