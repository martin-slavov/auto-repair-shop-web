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
import { updateUser } from '../../api/adminUsers'
import { ApiError } from '../../api/client'
import {
  USER_ROLE_LABELS,
  type UserAdmin,
  type UserProfileUpdateRequest,
} from '../../types/user'
import { profileApiErrors, validateProfile } from '../../lib/profile'
import ProfileFields from './ProfileFields'

function initialValues(user: UserAdmin | null): UserProfileUpdateRequest {
  return {
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  }
}

interface EditUserDialogProps {
  open: boolean
  user: UserAdmin | null
  onOpenChange: (open: boolean) => void
  onSaved: (user: UserAdmin) => void
  onRefreshNeeded: () => void
}

function EditUserDialog({
  open,
  user,
  onOpenChange,
  onSaved,
  onRefreshNeeded,
}: EditUserDialogProps) {
  const [values, setValues] = useState<UserProfileUpdateRequest>(() => initialValues(user))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(initialValues(user))
      setSubmitting(false)
      setError(null)
      setFieldErrors({})
      setNotFound(false)
    }
  }

  function setValue(key: keyof UserProfileUpdateRequest, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleOpenChange(nextOpen: boolean) {
    if (submitting) return
    if (!nextOpen && notFound) {
      onRefreshNeeded()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || submitting) return
    setError(null)

    const formErrors = validateProfile(values)
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const saved = await updateUser(user.id, {
        email: values.email.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      })
      setSubmitting(false)
      onSaved(saved)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const mapped = profileApiErrors(err)
        setFieldErrors(mapped.fieldErrors)
        setError(mapped.message)
        if (err.status === 404) {
          setNotFound(true)
        }
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
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Change the email and name. The username and role cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {user && (
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 rounded-md bg-muted px-3 py-2 text-sm">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="font-medium wrap-anywhere">{user.username}</dd>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">{USER_ROLE_LABELS[user.role]}</dd>
            </dl>
          )}

          <ProfileFields
            idPrefix="edit-user"
            values={values}
            errors={fieldErrors}
            disabled={submitting || notFound}
            onChange={setValue}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || notFound}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditUserDialog
