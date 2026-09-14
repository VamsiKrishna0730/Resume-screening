'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Lock, Mail, User, Building, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { validateSignupInput } from '@/lib/auth/auth-validation'

export default function SignupPage() {
  const { signup, isLoading } = useAuth()
  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const validation = validateSignupInput({ name, email, password, confirmPassword })
    if (!validation.isValid) {
      setClientErrors(validation.errors)
      return
    }
    setClientErrors({})

    try {
      await signup({ name, email, password, organization, role })
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please verify your details.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--background)' }}>
      <div className="panel" style={{ width: 'min(480px, 100%)', padding: '36px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>PRISM</span>
          </div>
          <p className="eyebrow" style={{ fontSize: '11px', color: 'var(--primary)' }}>
            {role === 'CANDIDATE' ? 'CREATE CANDIDATE ACCOUNT' : 'CREATE RECRUITER / RESEARCHER ACCOUNT'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
            {role === 'CANDIDATE'
              ? 'Upload your resume, analyze skill matches, and apply to requisitions.'
              : 'Access explainable AI matching, fairness audits, and candidate screening.'}
          </p>
        </div>

        {/* Role Selection Tabs (Default: Candidate) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--muted)', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: role === 'CANDIDATE' ? 'var(--card)' : 'transparent',
              color: role === 'CANDIDATE' ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontWeight: role === 'CANDIDATE' ? 600 : 500,
              fontSize: '12px',
              boxShadow: role === 'CANDIDATE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Candidate / Applicant
          </button>
          <button
            type="button"
            onClick={() => setRole('RECRUITER')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: role === 'RECRUITER' ? 'var(--card)' : 'transparent',
              color: role === 'RECRUITER' ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontWeight: role === 'RECRUITER' ? 600 : 500,
              fontSize: '12px',
              boxShadow: role === 'RECRUITER' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Recruiter / Talent Lead
          </button>
        </div>

        {serverError && (
          <div className="notice" style={{ marginBottom: '20px', padding: '10px 14px', fontSize: '12px', borderLeftColor: '#ef4444' }}>
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Dr. Jordan Lee"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '6px',
                  border: `1px solid ${clientErrors.name ? '#ef4444' : 'var(--border)'}`,
                  fontSize: '13px',
                }}
              />
            </div>
            {clientErrors.name && <small style={{ color: '#ef4444', fontSize: '11px' }}>{clientErrors.name}</small>}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Institutional / Work Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
              <input
                type="email"
                placeholder="jordan.lee@ai-institute.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '6px',
                  border: `1px solid ${clientErrors.email ? '#ef4444' : 'var(--border)'}`,
                  fontSize: '13px',
                }}
              />
            </div>
            {clientErrors.email && <small style={{ color: '#ef4444', fontSize: '11px' }}>{clientErrors.email}</small>}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Organization / Institution (Optional)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Building size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="University AI Lab / Enterprise HR"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '6px',
                    border: `1px solid ${clientErrors.password ? '#ef4444' : 'var(--border)'}`,
                    fontSize: '13px',
                  }}
                />
              </div>
              {clientErrors.password && <small style={{ color: '#ef4444', fontSize: '11px' }}>{clientErrors.password}</small>}
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Confirm
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
                <input
                  type="password"
                  placeholder="Re-enter"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '6px',
                    border: `1px solid ${clientErrors.confirmPassword ? '#ef4444' : 'var(--border)'}`,
                    fontSize: '13px',
                  }}
                />
              </div>
              {clientErrors.confirmPassword && <small style={{ color: '#ef4444', fontSize: '11px' }}>{clientErrors.confirmPassword}</small>}
            </div>
          </div>

          <button
            type="submit"
            className="button primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '10px', marginTop: '10px', justifyContent: 'center', fontSize: '13px' }}
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
            {!isLoading && <ArrowRight size={14} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
