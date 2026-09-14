/**
 * PRISM Authentication Types & Models
 */

export type UserRole = 'ADMIN' | 'RESEARCHER' | 'RECRUITER' | 'USER' | 'CANDIDATE'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  organization?: string
  candidateId?: string
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
