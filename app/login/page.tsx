'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Sparkles, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { validateLoginInput } from '@/lib/auth/auth-validation'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const { login, isLoading, authMode } = useAuth()
  const [email, setEmail] = useState('alex.miller@prism-ai.org')
  const [password, setPassword] = useState('Research@2026')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const validation = validateLoginInput({ email, password })
    if (!validation.isValid) {
      setClientErrors(validation.errors)
      return
    }
    setClientErrors({})

    try {
      await login(email, password, redirectTo)
    } catch (err: any) {
      setServerError(err.message || 'Authentication failed. Please verify credentials.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--background)' }}>
      <div className="panel" style={{ width: 'min(440px, 100%)', padding: '36px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>PRISM</span>
          </div>
          <p className="eyebrow" style={{ fontSize: '11px', color: 'var(--primary)' }}>AI RECRUITMENT INTELLIGENCE PLATFORM</p>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Fair · Explainable · Feedback-Adaptive
          </p>
        </div>

        {authMode === 'DEVELOPMENT' && (
          <div className="notice" style={{ marginBottom: '20px', padding: '10px 14px', fontSize: '11px', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <div>
                <strong>DEMO AUTHENTICATION ACTIVE</strong>
                <p style={{ margin: '2px 0 0' }}>Quick switch between Recruiter and Candidate experiences:</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                type="button"
                className="button outline"
                style={{ fontSize: '10px', padding: '3px 8px' }}
                onClick={() => {
                  setEmail('ananya.rao@candidate.org')
                  setPassword('Research@2026')
                }}
              >
                👤 Candidate (Ananya Rao)
              </button>
              <button
                type="button"
                className="button outline"
                style={{ fontSize: '10px', padding: '3px 8px' }}
                onClick={() => {
                  setEmail('sarah.chen@talentai.io')
                  setPassword('Research@2026')
                }}
              >
                💼 Recruiter (Sarah Chen)
              </button>
              <button
                type="button"
                className="button outline"
                style={{ fontSize: '10px', padding: '3px 8px' }}
                onClick={() => {
                  setEmail('alex.miller@prism-ai.org')
                  setPassword('Research@2026')
                }}
              >
                🔬 Admin (Dr. Alex Miller)
              </button>
            </div>
          </div>
        )}

        {serverError && (
          <div className="notice" style={{ marginBottom: '20px', padding: '10px 14px', fontSize: '12px', borderLeftColor: '#ef4444' }}>
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Work / Academic Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
              <input
                type="email"
                placeholder="name@institution.edu"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  if (clientErrors.email) setClientErrors(prev => ({ ...prev, email: '' }))
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '6px',
                  border: `1px solid ${clientErrors.email ? '#ef4444' : 'var(--border)'}`,
                  fontSize: '13px',
                }}
              />
            </div>
            {clientErrors.email && <small style={{ color: '#ef4444', fontSize: '11px' }}>{clientErrors.email}</small>}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (clientErrors.password) setClientErrors(prev => ({ ...prev, password: '' }))
                }}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 38px',
                  borderRadius: '6px',
                  border: `1px solid ${clientErrors.password ? '#ef4444' : 'var(--border)'}`,
                  fontSize: '13px',
                }}
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '8px', padding: '4px' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {clientErrors.password && <small style={{ color: '#ef4444', fontSize: '11px' }}>{clientErrors.password}</small>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
              <span>Remember this session</span>
            </label>
          </div>

          <button
            type="submit"
            className="button primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '10px', marginTop: '8px', justifyContent: 'center', fontSize: '13px' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Console'}
            {!isLoading && <ArrowRight size={14} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '18px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          Don't have an institutional account?{' '}
          <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading PRISM Authentication...</div>}>
      <LoginForm />
    </Suspense>
  )
}
