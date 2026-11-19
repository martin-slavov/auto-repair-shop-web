import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

interface LoginLocationState {
  registered?: boolean
  expired?: boolean
  from?: unknown
}

function safeReturnPath(from: unknown): string {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/'
}

function LoginPage() {
  useDocumentTitle('Login')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LoginLocationState | null
  const registered = state?.registered === true
  const expired = state?.expired === true
  const returnTo = safeReturnPath(state?.from)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (user) {
    return <Navigate to={returnTo} replace />
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      await login(username, password)
      navigate(returnTo, { replace: true })
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
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-3xl">Login</h1>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            {registered && (
              <p
                role="status"
                className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-text"
              >
                Account created, please log in.
              </p>
            )}
            {expired && !error && (
              <p
                role="status"
                className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
              >
                Your session has expired. Please log in again.
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                maxLength={50}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={Boolean(fieldErrors.username)}
              />
              {fieldErrors.username && (
                <p className="text-sm text-destructive">{fieldErrors.username}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                maxLength={72}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          No account?&nbsp;
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default LoginPage
