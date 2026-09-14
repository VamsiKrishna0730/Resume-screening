'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User, AuthSession, AuthState } from './auth-types'
import { authService } from './auth-service'

interface AuthContextType extends AuthState {
  authMode: 'DEVELOPMENT' | 'PRODUCTION'
  login: (email: string, password: string, redirectTo?: string) => Promise<void>
  signup: (data: { name: string; email: string; password: string; organization?: string; role?: import('./auth-types').UserRole }, redirectTo?: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Hydrate session on initial load
  useEffect(() => {
    let mounted = true
    const initSession = async () => {
      try {
        const session = await authService.getSession()
        if (mounted) {
          if (session && session.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
        }
      } catch (err) {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    initSession()
    return () => {
      mounted = false
    }
  }, [])

  // Route protection guard
  useEffect(() => {
    if (isLoading) return

    const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    if (!user && !isPublic) {
      const returnUrl = encodeURIComponent(pathname)
      router.push(`/login?redirectTo=${returnUrl}`)
    } else if (user && isPublic) {
      if (user.role === 'CANDIDATE') {
        router.push('/candidate')
      } else {
        router.push('/dashboard')
      }
    } else if (user && !isPublic) {
      // Role protection
      const isCandidatePath = pathname.startsWith('/candidate')
      if (user.role === 'CANDIDATE' && !isCandidatePath) {
        // Candidate trying to access recruiter / admin pages (/dashboard, /fairness, /jobs, etc.)
        router.push('/candidate')
      } else if (user.role !== 'CANDIDATE' && isCandidatePath) {
        // Recruiter / admin accessing candidate portal directly can be routed to /dashboard
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname, router])

  const login = useCallback(async (email: string, password: string, redirectTo?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const session = await authService.login(email, password)
      setUser(session.user)
      const defaultTarget = session.user.role === 'CANDIDATE' ? '/candidate' : '/dashboard'
      const target = redirectTo || defaultTarget
      router.push(target)
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const signup = useCallback(async (data: { name: string; email: string; password: string; organization?: string; role?: import('./auth-types').UserRole }, redirectTo?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const session = await authService.signup(data)
      setUser(session.user)
      const defaultTarget = session.user.role === 'CANDIDATE' ? '/candidate' : '/dashboard'
      const target = redirectTo || defaultTarget
      router.push(target)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      router.push('/login')
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const resetPassword = useCallback(async (email: string) => {
    return authService.resetPassword(email)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        error,
        authMode: authService.mode,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
