import { Input } from '@/components/ui/input'
import FormField from '@/components/FormField'
import { fieldErrorProps } from '@/lib/fieldErrorProps'
import { EMAIL_MAX, NAME_MAX } from '../../lib/profile'
import type { UserProfileUpdateRequest } from '../../types/user'

interface ProfileFieldsProps {
  idPrefix: string
  values: UserProfileUpdateRequest
  errors: Record<string, string>
  disabled?: boolean
  onChange: (key: keyof UserProfileUpdateRequest, value: string) => void
}

function ProfileFields({ idPrefix, values, errors, disabled, onChange }: ProfileFieldsProps) {
  const emailId = `${idPrefix}-email`
  const firstNameId = `${idPrefix}-first-name`
  const lastNameId = `${idPrefix}-last-name`

  return (
    <>
      <FormField id={emailId} label="Email" error={errors.email}>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          maxLength={EMAIL_MAX}
          required
          disabled={disabled}
          value={values.email}
          onChange={(event) => onChange('email', event.target.value)}
          {...fieldErrorProps(emailId, errors.email)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id={firstNameId} label="First name" error={errors.firstName}>
          <Input
            id={firstNameId}
            type="text"
            autoComplete="given-name"
            maxLength={NAME_MAX}
            required
            disabled={disabled}
            value={values.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
            {...fieldErrorProps(firstNameId, errors.firstName)}
          />
        </FormField>

        <FormField id={lastNameId} label="Last name" error={errors.lastName}>
          <Input
            id={lastNameId}
            type="text"
            autoComplete="family-name"
            maxLength={NAME_MAX}
            required
            disabled={disabled}
            value={values.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
            {...fieldErrorProps(lastNameId, errors.lastName)}
          />
        </FormField>
      </div>
    </>
  )
}

export default ProfileFields
