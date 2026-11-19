import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { login as loginRequest } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import type { AuthUser, LogoutReason } from '../types/auth'
import { AuthContext } from './AuthContext'
import { decodeToken } from './jwt'
import { getToken, removeToken, setToken } from './tokenStorage'

const MAX_TIMEOUT_MS = 2_147_483_647

interface AuthState {
  user: AuthUser | null
  logoutReason: LogoutReason | null
}

function loadStateFromStorage(): AuthState {
  const token = getToken()
  if (!token) {
    return { user: null, logoutReason: null }
  }

  const user = decodeToken(token)
  if (!user) {
    removeToken()
    return { user: null, logoutReason: 'expired' }
  }
  return { user, logoutReason: null }
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStateFromStorage)
  const { user, logoutReason } = state

  async function login(username: string, password: string) {
    const token = await loginRequest(username, password)
    const newUser = decodeToken(token)
    if (!newUser) {
      throw new Error('The server returned an invalid token.')
    }
    setToken(token)
    setState({ user: newUser, logoutReason: null })
  }

  const logout = useCallback(() => {
    removeToken()
    setState({ user: null, logoutReason: 'manual' })
  }, [])

  const expire = useCallback(() => {
    removeToken()
    setState({ user: null, logoutReason: 'expired' })
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(expire)
    return () => setUnauthorizedHandler(null)
  }, [expire])

  useEffect(() => {
    if (!user) return
    const delay = user.expiresAt - Date.now()
    if (delay > MAX_TIMEOUT_MS) return
    const timer = setTimeout(expire, Math.max(delay, 0))
    return () => clearTimeout(timer)
  }, [user, expire])

  return (
    <AuthContext.Provider value={{ user, logoutReason, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
