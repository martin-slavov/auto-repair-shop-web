import { useState, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import FormField from '@/components/FormField'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { SELECT_CLASS } from '@/lib/fieldClasses'
import { createUser } from '../../api/adminUsers'
import { ApiError } from '../../api/client'
import { validatePasswordPair } from '../../lib/password'
import type { RegisterResponse } from '../../types/auth'
import { CREATABLE_ROLES, USER_ROLE_LABELS, type CreatableRole } from '../../types/user'

interface FormValues {
  role: CreatableRole
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

const initialValues: FormValues = {
  role: 'MECHANIC',
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
}

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (user: RegisterResponse) => void
}

function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(initialValues)
      setSubmitting(false)
      setError(null)
      setFieldErrors({})
    }
  }

  function setValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleOpenChange(nextOpen: boolean) {
    if (submitting) return
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formErrors = validatePasswordPair(values.password, values.confirmPassword)
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    setSubmitting(true)
    const { role, ...body } = values
    try {
      const created = await createUser(role, body)
      setSubmitting(false)
      onCreated(created)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const hasFieldErrors = Object.keys(err.fieldErrors).length > 0
        setFieldErrors(err.fieldErrors)
        setError(hasFieldErrors ? null : err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Create a mechanic or admin account. Customers register themselves.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <FormField id="user-role" label="Role">
            <select
              id="user-role"
              required
              value={values.role}
              onChange={(event) => setValue('role', event.target.value as CreatableRole)}
              className={SELECT_CLASS}
            >
              {CREATABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {USER_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="user-username" label="Username" error={fieldErrors.username}>
            <Input
              id="user-username"
              type="text"
              autoComplete="off"
              maxLength={50}
              required
              value={values.username}
              onChange={(event) => setValue('username', event.target.value)}
              {...fieldErrorProps('user-username', fieldErrors.username)}
            />
          </FormField>

          <FormField id="user-email" label="Email" error={fieldErrors.email}>
            <Input
              id="user-email"
              type="email"
              autoComplete="off"
              maxLength={254}
              required
              value={values.email}
              onChange={(event) => setValue('email', event.target.value)}
              {...fieldErrorProps('user-email', fieldErrors.email)}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="user-first-name" label="First name" error={fieldErrors.firstName}>
              <Input
                id="user-first-name"
                type="text"
                autoComplete="off"
                maxLength={50}
                required
                value={values.firstName}
                onChange={(event) => setValue('firstName', event.target.value)}
                {...fieldErrorProps('user-first-name', fieldErrors.firstName)}
              />
            </FormField>
            <FormField id="user-last-name" label="Last name" error={fieldErrors.lastName}>
              <Input
                id="user-last-name"
                type="text"
                autoComplete="off"
                maxLength={50}
                required
                value={values.lastName}
                onChange={(event) => setValue('lastName', event.target.value)}
                {...fieldErrorProps('user-last-name', fieldErrors.lastName)}
              />
            </FormField>
          </div>

          <FormField id="user-password" label="Password" error={fieldErrors.password}>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              value={values.password}
              onChange={(event) => setValue('password', event.target.value)}
              {...fieldErrorProps('user-password', fieldErrors.password)}
            />
          </FormField>

          <FormField
            id="user-confirm-password"
            label="Confirm password"
            error={fieldErrors.confirmPassword}
          >
            <Input
              id="user-confirm-password"
              type="password"
              autoComplete="new-password"
              maxLength={255}
              required
              value={values.confirmPassword}
              onChange={(event) => setValue('confirmPassword', event.target.value)}
              {...fieldErrorProps('user-confirm-password', fieldErrors.confirmPassword)}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateUserDialog
