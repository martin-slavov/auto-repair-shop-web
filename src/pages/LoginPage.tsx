import { useState, type SubmitEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean } | null)?.registered === true

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      await login(username, password)
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Invalid username or password.' : err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1>Login</h1>
      {registered && <p className="success">Account created, please log in.</p>}
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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            maxLength={72}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </>
  )
}

export default LoginPage
