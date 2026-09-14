/**
 * PRISM Authentication Service & Provider Abstraction
 * Supports Development/Demo mode with secure browser session persistence
 * and extensible interface for Production OAuth / JWT backends.
 */

import { User, UserRole, AuthSession } from './auth-types'

export interface AuthProvider {
  mode: 'DEVELOPMENT' | 'PRODUCTION'
  login(email: string, password: string): Promise<AuthSession>
  signup(data: { name: string; email: string; password: string; organization?: string; role?: UserRole }): Promise<AuthSession>
  logout(): Promise<void>
  getSession(): Promise<AuthSession | null>
  resetPassword(email: string): Promise<boolean>
}

const STORAGE_SESSION_KEY = 'prism_auth_session'
const STORAGE_USERS_KEY = 'prism_registered_users'

const SEED_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Dr. Alex Miller',
    email: 'alex.miller@prism-ai.org',
    role: 'ADMIN',
    organization: 'PRISM AI Research Consortium',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'USR-002',
    name: 'Sarah Chen',
    email: 'sarah.chen@talentai.io',
    role: 'RECRUITER',
    organization: 'Global Tech Recruiting',
    createdAt: '2026-02-10T10:30:00Z',
  },
  {
    id: 'USR-003',
    name: 'Prof. David Kumar',
    email: 'david.kumar@univ-ai.edu',
    role: 'RESEARCHER',
    organization: 'Institute for Fair AI Systems',
    createdAt: '2026-02-20T14:15:00Z',
  },
  {
    id: 'USR-004',
    name: 'Ananya Rao',
    email: 'ananya.rao@candidate.org',
    role: 'CANDIDATE',
    candidateId: 'C-1001',
    organization: 'Independent Candidate',
    createdAt: '2026-03-01T09:00:00Z',
  }
]

export class DevelopmentAuthProvider implements AuthProvider {
  public mode: 'DEVELOPMENT' = 'DEVELOPMENT'

  private getUsers(): User[] {
    if (typeof window === 'undefined') return SEED_USERS
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS))
      return SEED_USERS
    } catch {
      return SEED_USERS
    }
  }

  private saveUser(user: User): void {
    if (typeof window === 'undefined') return
    try {
      const users = this.getUsers()
      const updated = [...users.filter(u => u.email.toLowerCase() !== user.email.toLowerCase()), user]
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated))
    } catch {}
  }

  async login(email: string, password: string): Promise<AuthSession> {
    // Artificial latency for realistic UI state handling
    await new Promise(resolve => setTimeout(resolve, 350))

    const cleanEmail = email.trim().toLowerCase()
    const users = this.getUsers()
    let user = users.find(u => u.email.toLowerCase() === cleanEmail)

    // In demo mode, if the user doesn't exist, we can authenticate or create a researcher session
    if (!user) {
      if (password.length < 6) {
        throw new Error('Invalid credentials or password too short (min 6 characters).')
      }
      user = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email: cleanEmail,
        role: 'RESEARCHER',
        organization: 'PRISM Research Lab',
        createdAt: new Date().toISOString(),
      }
      this.saveUser(user)
    }

    const session: AuthSession = {
      user,
      token: `demo_jwt_token_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session))
      } catch {}
    }

    return session
  }

  async signup(data: { name: string; email: string; password: string; organization?: string; role?: UserRole }): Promise<AuthSession> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const cleanEmail = data.email.trim().toLowerCase()
    const users = this.getUsers()
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail)
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in.')
    }

    // Default to CANDIDATE role; allow RECRUITER or RESEARCHER only if explicitly requested, never allow arbitrary ADMIN creation
    let targetRole: UserRole = 'CANDIDATE'
    if (data.role === 'RECRUITER' || data.role === 'RESEARCHER') {
      targetRole = data.role
    }

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: targetRole,
      organization: data.organization?.trim() || (targetRole === 'CANDIDATE' ? 'Independent Candidate' : 'AI Recruitment Enterprise'),
      createdAt: new Date().toISOString(),
    }

    this.saveUser(newUser)

    const session: AuthSession = {
      user: newUser,
      token: `demo_jwt_token_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session))
      } catch {}
    }

    return session
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_SESSION_KEY)
      } catch {}
    }
  }

  async getSession(): Promise<AuthSession | null> {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY)
      if (!stored) return null
      const session: AuthSession = JSON.parse(stored)
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_SESSION_KEY)
        return null
      }
      return session
    } catch {
      return null
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const cleanEmail = email.trim().toLowerCase()
    const users = this.getUsers()
    // Always succeed without leaking whether the email exists
    return true
  }
}

export const authService = new DevelopmentAuthProvider()
