import { useState, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import FormField from '@/components/FormField'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { ApiError } from '../api/client'
import { CHANGE_PASSWORD_ERRORS, changeOwnPassword } from '../api/users'
import { useAuth } from '../auth/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { validatePasswordPair } from '../lib/password'
import { USER_ROLE_LABELS } from '../types/user'

const PASSWORD_MIN_LENGTH = 8

const SERVER_ERROR_FIELDS: Record<string, 'currentPassword' | 'newPassword'> = {
  [CHANGE_PASSWORD_ERRORS.currentIncorrect]: 'currentPassword',
  [CHANGE_PASSWORD_ERRORS.sameAsCurrent]: 'newPassword',
  [CHANGE_PASSWORD_ERRORS.tooLong]: 'newPassword',
}

interface PasswordValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const EMPTY_VALUES: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

function validate(values: PasswordValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (values.currentPassword === '') {
    errors.currentPassword = 'Enter your current password.'
  }

  const pairErrors = validatePasswordPair(values.newPassword, values.confirmPassword)
  if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  } else if (pairErrors.password) {
    errors.newPassword = pairErrors.password
  } else if (values.currentPassword !== '' && values.newPassword === values.currentPassword) {
    errors.newPassword = 'New password must be different from the current password.'
  }
  if (pairErrors.confirmPassword) {
    errors.confirmPassword = pairErrors.confirmPassword
  }
  return errors
}

function AccountPage() {
  useDocumentTitle('My account')
  const { user } = useAuth()
  const [values, setValues] = useState<PasswordValues>(EMPTY_VALUES)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function setValue(key: keyof PasswordValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSuccess(null)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const formErrors = validate(values)
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      await changeOwnPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setValues(EMPTY_VALUES)
      setSuccess('Your password was changed. You stay logged in on this device.')
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const field = SERVER_ERROR_FIELDS[err.message]
        if (Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors)
        } else if (field) {
          setFieldErrors({ [field]: `${err.message}.` })
        } else {
          setError(err.message)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }
    setSubmitting(false)
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <h1>My account</h1>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-xl">Profile</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Username</dt>
            <dd className="font-medium wrap-anywhere">{user.username}</dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{USER_ROLE_LABELS[user.role]}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-xl">Change password</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            {success && (
              <p
                role="status"
                className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-text"
              >
                {success}
              </p>
            )}

            <FormField
              id="account-current-password"
              label="Current password"
              error={fieldErrors.currentPassword}
            >
              <Input
                id="account-current-password"
                type="password"
                autoComplete="current-password"
                required
                value={values.currentPassword}
                onChange={(event) => setValue('currentPassword', event.target.value)}
                {...fieldErrorProps('account-current-password', fieldErrors.currentPassword)}
              />
            </FormField>

            <FormField
              id="account-new-password"
              label="New password"
              error={fieldErrors.newPassword}
            >
              <Input
                id="account-new-password"
                type="password"
                autoComplete="new-password"
                required
                value={values.newPassword}
                onChange={(event) => setValue('newPassword', event.target.value)}
                {...fieldErrorProps('account-new-password', fieldErrors.newPassword)}
              />
            </FormField>

            <FormField
              id="account-confirm-password"
              label="Confirm new password"
              error={fieldErrors.confirmPassword}
            >
              <Input
                id="account-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={values.confirmPassword}
                onChange={(event) => setValue('confirmPassword', event.target.value)}
                {...fieldErrorProps('account-confirm-password', fieldErrors.confirmPassword)}
              />
            </FormField>

            <Button type="submit" className="self-start" disabled={submitting}>
              {submitting ? 'Saving…' : 'Change password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountPage
