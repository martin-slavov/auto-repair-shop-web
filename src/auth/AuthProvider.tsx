import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { login as loginRequest } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import type { AuthUser } from '../types/auth'
import { AuthContext } from './AuthContext'
import { decodeToken } from './jwt'
import { getToken, removeToken, setToken } from './tokenStorage'

function loadUserFromStorage(): AuthUser | null {
  const token = getToken()
  if (!token) {
    return null
  }

  const user = decodeToken(token)
  if (!user) {
    removeToken()
  }
  return user
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUserFromStorage)

  async function login(username: string, password: string) {
    const token = await loginRequest(username, password)
    const newUser = decodeToken(token)
    if (!newUser) {
      throw new Error('The server returned an invalid token.')
    }
    setToken(token)
    setUser(newUser)
  }

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
