'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { validateEmail } from '@/lib/auth/auth-validation'

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailError(null)

    await resetPassword(email)
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--background)' }}>
      <div className="panel" style={{ width: 'min(440px, 100%)', padding: '36px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>PRISM</span>
          </div>
          <p className="eyebrow" style={{ fontSize: '11px', color: 'var(--primary)' }}>PASSWORD RECOVERY</p>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Enter your account email to receive a password recovery link.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Check size={24} />
            </div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Reset Instructions Sent</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: '1.6', marginBottom: '20px' }}>
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions. In development mode, reset requests are recorded in the audit log.
            </p>
            <Link href="/login" className="button primary" style={{ width: '100%', justifyContent: 'center' }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Account Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--muted-foreground)' }} />
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '6px',
                    border: `1px solid ${emailError ? '#ef4444' : 'var(--border)'}`,
                    fontSize: '13px',
                  }}
                />
              </div>
              {emailError && <small style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{emailError}</small>}
            </div>

            <button
              type="submit"
              className="button primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '13px' }}
            >
              {isLoading ? 'Submitting...' : 'Send Recovery Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                <ArrowLeft size={13} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
