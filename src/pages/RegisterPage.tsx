import { useState, type SubmitEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { register } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

function RegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formErrors: Record<string, string> = {}
    if (new TextEncoder().encode(password).length > 72) {
      formErrors.password =
        'Password cannot be more than 72 bytes (some characters, like emoji, count as more than one).'
    }
    if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match.'
    }
    setFieldErrors(formErrors)
    if (Object.keys(formErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      await register({ username, email, firstName, lastName, password, confirmPassword })
      navigate('/login', { state: { registered: true } })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1>Register</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            maxLength={50}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            maxLength={50}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            maxLength={50}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            maxLength={255}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {fieldErrors.confirmPassword && (
            <span className="field-error">{fieldErrors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </>
  )
}

export default RegisterPage
