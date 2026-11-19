import { useState } from 'react'

export interface RangeValues {
  from: string
  to: string
}

const emptyRange: RangeValues = { from: '', to: '' }

export function isDateRangeInvalid({ from, to }: RangeValues): boolean {
  return from !== '' && to !== '' && from > to
}

export function isNumberRangeInvalid({ from, to }: RangeValues): boolean {
  return from.trim() !== '' && to.trim() !== '' && Number(from) > Number(to)
}

export function useRangeFilter(
  isInvalid: (range: RangeValues) => boolean,
  apply: (range: RangeValues) => void,
) {
  const [range, setRange] = useState<RangeValues>(emptyRange)

  function change(key: keyof RangeValues, value: string) {
    const next = { ...range, [key]: value }
    setRange(next)
    if (isInvalid(next)) return
    apply(next)
  }

  function clear() {
    setRange(emptyRange)
  }

  return {
    range,
    invalid: isInvalid(range),
    isEmpty: range.from === '' && range.to === '',
    change,
    clear,
  }
}
