import { useCallback, useEffect, useState } from 'react'
import { getVisitParts } from '../api/serviceVisits'
import type { VisitPart } from '../types/serviceVisit'

interface VisitPartsResult {
  visitId: number | null
  reloadKey: number
  parts: VisitPart[] | null
  error: string | null
}

export function useVisitParts(visitId: number | null) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<VisitPartsResult>({
    visitId: null,
    reloadKey: 0,
    parts: null,
    error: null,
  })

  useEffect(() => {
    if (visitId === null) return
    const controller = new AbortController()
    getVisitParts(visitId, controller.signal)
      .then((parts) => setResult({ visitId, reloadKey, parts, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setResult({ visitId, reloadKey, parts: null, error: message })
      })
    return () => controller.abort()
  }, [visitId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const current = visitId !== null && result.visitId === visitId
  const loading = visitId !== null && (!current || result.reloadKey !== reloadKey)

  return {
    parts: current ? result.parts : null,
    error: current ? result.error : null,
    loading,
    reload,
  }
}
