import { useEffect, useState, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import FormField from '@/components/FormField'
import ProfileFields from '@/components/users/ProfileFields'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { ApiError } from '../api/client'
import {
  CHANGE_PASSWORD_ERRORS,
  changeOwnPassword,
  getMyProfile,
  updateMyProfile,
} from '../api/users'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { profileApiErrors, validateProfile } from '../lib/profile'
import { validatePasswordPair } from '../lib/password'
import { USER_ROLE_LABELS, type UserProfile, type UserProfileUpdateRequest } from '../types/user'

const PASSWORD_MIN_LENGTH = 8

const SERVER_ERROR_FIELDS: Record<string, 'currentPassword' | 'newPassword'> = {
  [CHANGE_PASSWORD_ERRORS.currentIncorrect]: 'currentPassword',
  [CHANGE_PASSWORD_ERRORS.sameAsCurrent]: 'newPassword',
  [CHANGE_PASSWORD_ERRORS.tooLong]: 'newPassword',
}

const ERROR_BOX =
  'rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'
const SUCCESS_BOX =
  'rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-text'

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

function ProfileDetails({ profile }: { profile: UserProfile }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
      <dt className="text-muted-foreground">Username</dt>
      <dd className="font-medium wrap-anywhere">{profile.username}</dd>
      <dt className="text-muted-foreground">Role</dt>
      <dd className="font-medium">{USER_ROLE_LABELS[profile.role]}</dd>
      <dt className="text-muted-foreground">Email</dt>
      <dd className="font-medium wrap-anywhere">{profile.email}</dd>
      <dt className="text-muted-foreground">First name</dt>
      <dd className="font-medium wrap-anywhere">{profile.firstName}</dd>
      <dt className="text-muted-foreground">Last name</dt>
      <dd className="font-medium wrap-anywhere">{profile.lastName}</dd>
    </dl>
  )
}

interface EditProfileFormProps {
  profile: UserProfile
  onSaved: (profile: UserProfile) => void
}

function EditProfileForm({ profile, onSaved }: EditProfileFormProps) {
  const [values, setValues] = useState<UserProfileUpdateRequest>({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function setValue(key: keyof UserProfileUpdateRequest, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSuccess(null)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSuccess(null)

    const formErrors = validateProfile(values)
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const saved = await updateMyProfile({
        email: values.email.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      })
      setValues({ email: saved.email, firstName: saved.firstName, lastName: saved.lastName })
      setSuccess('Your profile was saved.')
      onSaved(saved)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const mapped = profileApiErrors(err)
        setFieldErrors(mapped.fieldErrors)
        setError(mapped.message)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <p role="alert" className={ERROR_BOX}>
          {error}
        </p>
      )}
      {success && (
        <p role="status" className={SUCCESS_BOX}>
          {success}
        </p>
      )}

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 rounded-md bg-muted px-3 py-2 text-sm">
        <dt className="text-muted-foreground">Username</dt>
        <dd className="font-medium wrap-anywhere">{profile.username}</dd>
        <dt className="text-muted-foreground">Role</dt>
        <dd className="font-medium">{USER_ROLE_LABELS[profile.role]}</dd>
      </dl>

      <ProfileFields
        idPrefix="account"
        values={values}
        errors={fieldErrors}
        onChange={setValue}
      />

      <Button type="submit" className="self-start" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  )
}

function ChangePasswordForm() {
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
    if (submitting) return
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

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <p role="alert" className={ERROR_BOX}>
          {error}
        </p>
      )}
      {success && (
        <p role="status" className={SUCCESS_BOX}>
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

      <FormField id="account-new-password" label="New password" error={fieldErrors.newPassword}>
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
  )
}

interface ProfileResult {
  key: number
  profile: UserProfile | null
  error: string | null
}

function AccountPage() {
  useDocumentTitle('My account')
  const [loadKey, setLoadKey] = useState(0)
  const [result, setResult] = useState<ProfileResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getMyProfile(controller.signal)
      .then((profile) => setResult({ key: loadKey, profile, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setResult({
          key: loadKey,
          profile: null,
          error: err instanceof Error ? err.message : 'Something went wrong',
        })
      })
    return () => controller.abort()
  }, [loadKey])

  const loading = result?.key !== loadKey
  const profile = loading ? null : (result?.profile ?? null)
  const loadError = loading ? null : (result?.error ?? null)

  function handleSaved(saved: UserProfile) {
    setResult({ key: loadKey, profile: saved, error: null })
  }

  let profileContent
  if (loading) {
    profileContent = <p className="text-sm text-muted-foreground">Loading your profile…</p>
  } else if (loadError || !profile) {
    profileContent = (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className={ERROR_BOX}>
          Could not load your profile: {loadError ?? 'Something went wrong'}
        </p>
        <Button variant="outline" onClick={() => setLoadKey((key) => key + 1)}>
          Try again
        </Button>
      </div>
    )
  } else {
    profileContent = <ProfileDetails profile={profile} />
  }

  return (
    <div className="flex flex-col gap-6">
      <h1>My account</h1>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-xl">Profile</h2>
        </CardHeader>
        <CardContent>{profileContent}</CardContent>
      </Card>

      {profile && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <h2 className="text-xl">Edit profile</h2>
          </CardHeader>
          <CardContent>
            <EditProfileForm key={profile.id} profile={profile} onSaved={handleSaved} />
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-xl">Change password</h2>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountPage
