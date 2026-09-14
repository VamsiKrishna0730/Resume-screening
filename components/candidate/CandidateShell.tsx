'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

const candidateNavItems = [
  ['Home', '/candidate', Home],
  ['My Profile', '/candidate/profile', User],
  ['My Resume', '/candidate/resume', FileText],
  ['Find Jobs', '/candidate/jobs', Briefcase],
  ['My Applications', '/candidate/applications', Layers],
  ['Resume Analysis', '/candidate/analysis', Sparkles],
  ['Settings', '/candidate/settings', Settings],
] as const

interface CandidateShellProps {
  children: React.ReactNode
}

export function CandidateShell({ children }: CandidateShellProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CD'

  return (
    <div className="app-shell">
      {/* Candidate Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ background: '#131b26' }}>
        <div className="brand">
          <div className="brand-mark" style={{ background: 'var(--primary)', color: '#fff' }}>
            <Sparkles size={17} />
          </div>
          <div>
            <strong>PRISM</strong>
            <small style={{ color: 'var(--accent)' }}>Candidate Portal</small>
          </div>
        </div>

        <div className="workspace" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <span className="workspace-dot" style={{ background: '#10b981' }} />
          <span>Candidate Workspace</span>
          <ChevronDown size={13} />
        </div>

        <nav>
          {candidateNavItems.map(([label, href, Icon]) => {
            const isActive = href === '/candidate' ? pathname === '/candidate' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <button
                  className={isActive ? 'active' : ''}
                  style={{ width: '100%' }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="research-card" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <strong style={{ color: '#fff', fontSize: '11px' }}>AI Career Match Engine</strong>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px' }}>
              Upload your resume for automated skills extraction and transparent XAI matching against active requisitions.
            </p>
          </div>

          <div className="user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTopColor: 'rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="avatar small" style={{ background: 'var(--primary)', color: '#fff' }}>{initials}</div>
              <div>
                <strong style={{ color: '#fff' }}>{user?.name || 'Candidate'}</strong>
                <small style={{ color: 'rgba(255,255,255,0.6)' }}>Candidate Account</small>
              </div>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              style={{ padding: '6px', color: 'rgba(255,255,255,0.7)', background: 'transparent', borderColor: 'transparent' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
            <Menu size={20} />
          </button>

          <div className="crumb">
            <span>PRISM</span>
            <span>/</span>
            <span>CANDIDATE</span>
            <span>/</span>
            <strong>
              {pathname === '/candidate' ? 'HOME' : pathname.split('/')[2]?.toUpperCase() || 'HOME'}
            </strong>
          </div>

          <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-teal" style={{ fontSize: '11px', padding: '4px 8px' }}>
              Candidate Mode
            </span>
            <button
              className="button outline"
              onClick={logout}
              style={{ fontSize: '12px', padding: '6px 10px', gap: '6px' }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </header>

        <div className="content">
          {children}
        </div>
      </main>
    </div>
  )
}
