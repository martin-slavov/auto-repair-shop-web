interface ActiveFieldProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint: string
  error?: string
}

function ActiveField({ id, checked, onChange, hint, error }: ActiveFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex w-fit items-center gap-2 text-sm font-medium">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={`${id}-hint`}
          className="size-4 accent-primary"
        />
        Active
      </label>
      <p id={`${id}-hint`} className="text-sm text-muted-foreground">
        {hint}
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export default ActiveField
