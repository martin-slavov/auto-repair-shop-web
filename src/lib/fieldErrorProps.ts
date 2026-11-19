export function fieldErrorProps(id: string, error: string | undefined) {
  return {
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}
