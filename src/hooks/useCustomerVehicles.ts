import { useEffect, useState } from 'react'
import { getVehicles } from '../api/vehicles'
import type { Vehicle } from '../types/vehicle'

const PAGE_SIZE = 50

async function loadAllVehicles(signal: AbortSignal): Promise<Vehicle[]> {
  const vehicles: Vehicle[] = []
  let page = 0
  for (;;) {
    const result = await getVehicles({ page, size: PAGE_SIZE, sort: 'licensePlate,asc' }, signal)
    vehicles.push(...result.content)
    page += 1
    if (page >= result.totalPages) return vehicles
  }
}

interface CustomerVehiclesState {
  vehicles: Vehicle[] | null
  error: string | null
}

export function useCustomerVehicles(enabled: boolean): CustomerVehiclesState {
  const [state, setState] = useState<CustomerVehiclesState>({ vehicles: null, error: null })

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    loadAllVehicles(controller.signal)
      .then((vehicles) => setState({ vehicles, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setState({ vehicles: null, error: message })
      })
    return () => controller.abort()
  }, [enabled])

  return state
}
