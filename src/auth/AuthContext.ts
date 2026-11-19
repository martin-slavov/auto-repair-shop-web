import { createContext } from 'react'
import type { AuthUser, LogoutReason } from '../types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  logoutReason: LogoutReason | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
