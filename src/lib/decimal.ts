interface DecimalRule {
  label: string
  integerDigits: number
  allowZero?: boolean
}

export function decimalMax(integerDigits: number): number {
  return Number(`${'9'.repeat(integerDigits)}.99`)
}

export function validateDecimal(
  value: string,
  { label, integerDigits, allowZero = false }: DecimalRule,
): string | null {
  const text = value.trim()
  if (text === '') return `${label} is required.`
  if (!new RegExp(`^\\d{1,${integerDigits}}(\\.\\d{1,2})?$`).test(text)) {
    return `${label} must be a number with up to ${integerDigits} digits and 2 decimal places.`
  }
  const number = Number(text)
  if (!allowZero && number <= 0) return `${label} must be greater than zero.`
  const max = decimalMax(integerDigits)
  if (number > max) return `${label} must not exceed ${max}.`
  return null
}
