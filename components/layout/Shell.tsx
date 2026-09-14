'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Gauge,
  Users,
  BriefcaseBusiness,
  FlaskConical,
  ShieldCheck,
  Send,
  BarChart3,
  Settings,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Menu,
  Bell,
  Search,
  Check,
  X,
  LogOut,
  User as UserIcon,
  Radio,
  Play,
  Pause,
  Plus,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Video,
  MessageSquare,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { useAuth } from '@/lib/auth/auth-context'
import { PopoverDropdown } from '@/components/ui/PopoverDropdown'
import { CandidateShell } from '@/components/candidate/CandidateShell'

const navItems = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Jobs', '/jobs', BriefcaseBusiness],
  ['Candidates', '/candidates', Users],
  ['Screening', '/screening', Gauge],
  ['Fairness', '/fairness', ShieldCheck],
  ['Feedback', '/feedback', Send],
  ['Experiments', '/experiments', FlaskConical],
  ['Models', '/models', BarChart3],
  ['Settings', '/settings', Settings],
] as const

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { resetDemo, candidatesList, jobsList, simulationRunning, setSimulationRunning } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'search' | 'startStreaming' | 'notifications' | 'messages' | 'streaming' | 'quickActions' | 'profile' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // New stream form state
  const [newStreamTitle, setNewStreamTitle] = useState('')
  const [streamTitleError, setStreamTitleError] = useState('')
  const [newStreamCategory, setNewStreamCategory] = useState('Research Demo')
  const [newStreamVisibility, setNewStreamVisibility] = useState<'Public' | 'Consortium Only'>('Public')

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New High-Score Candidate Match',
      message: 'Alex Morgan achieved a 94% match for Senior ML Requisition.',
      time: '2 mins ago',
      type: 'match',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Fairness Mitigation Check Completed',
      message: 'Demographic parity gap mitigated by 50% across cohorts.',
      time: '12 mins ago',
      type: 'fairness',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Offline Feedback Batch Queued',
      message: 'Recruiter decisions logged for retraining progression.',
      time: '1 hour ago',
      type: 'feedback',
      read: true,
    },
  ])

  // Messages state
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'Dr. Elena Rostova',
      role: 'Principal Investigator',
      avatar: 'ER',
      preview: 'The demographic parity reweighting ablation on seed 42 looks promising for Section 5.',
      time: '5 mins ago',
      read: false,
    },
    {
      id: 'msg-2',
      sender: 'Marcus Chen',
      role: 'Senior ML Engineer',
      avatar: 'MC',
      preview: 'Exported candidate batch scoring latency benchmarks. P95 latency is under 3.1ms.',
      time: '28 mins ago',
      read: false,
    },
    {
      id: 'msg-3',
      sender: 'Sarah Jenkins',
      role: 'Talent Acquisition Lead',
      avatar: 'SJ',
      preview: 'Reviewed the shortlist for Requisition J-101. Recruiter calibration notes added.',
      time: '2 hours ago',
      read: true,
    },
  ])

  // Live streaming sessions state
  const [liveSessions, setLiveSessions] = useState([
    {
      id: 'stream-1',
      title: 'Real-Time Candidate Matching & Scoring Demo',
      host: 'PRISM Research Core',
      viewers: 18,
      status: 'LIVE',
      category: 'Research Demo',
    },
    {
      id: 'stream-2',
      title: 'Fairness & Bias Mitigation Audit Walkthrough',
      host: 'Dr. David Kumar',
      viewers: 7,
      status: 'LIVE',
      category: 'Audit Lab',
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length
  const unreadMessageCount = messages.filter(m => !m.read).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    notify('All notifications marked as read')
  }

  const markAllMessagesAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })))
    notify('All messages marked as read')
  }

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const dismissMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const toggleDropdown = (name: 'search' | 'startStreaming' | 'notifications' | 'messages' | 'streaming' | 'quickActions' | 'profile') => {
    setActiveDropdown(prev => {
      const next = prev === name ? null : name
      if (next === 'startStreaming') {
        setStreamTitleError('')
      }
      return next
    })
  }

  const closeDropdown = () => {
    setActiveDropdown(null)
    setStreamTitleError('')
  }

  const handleStartNewStream = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = newStreamTitle.trim()
    if (!trimmedTitle) {
      setStreamTitleError('Please enter a stream title.')
      return
    }
    setStreamTitleError('')
    const newSession = {
      id: `stream-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: trimmedTitle,
      host: user?.name || 'Lead Researcher',
      viewers: 1,
      status: 'LIVE',
      category: newStreamCategory,
    }
    setLiveSessions(prev => [newSession, ...prev])
    setNewStreamTitle('')
    closeDropdown()
    notify(`Live broadcast started: "${newSession.title}"`)
  }

  const notify = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2600)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setActiveDropdown(prev => (prev === 'search' ? null : 'search'))
      } else if (e.key === 'Escape') {
        setActiveDropdown(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const matchingCandidates = candidatesList.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const matchingJobs = jobsList.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isAuthPage = ['/login', '/signup', '/forgot-password'].some(p => pathname.startsWith(p))

  if (isAuthPage) {
    return <main>{children}</main>
  }

  if (pathname.startsWith('/candidate')) {
    return <CandidateShell>{children}</CandidateShell>
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AM'

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={17} />
          </div>
          <div>
            <strong>PRISM</strong>
            <small>SaaS AI Console</small>
          </div>
        </div>

        <div className="workspace">
          <span className="workspace-dot" /> Hiring workspace <ChevronDown size={13} />
        </div>

        <nav>
          {navItems.map(([label, href, Icon]) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <button
                  className={isActive ? 'active' : ''}
                  style={{ width: '100%' }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {label === 'Fairness' && <i className="nav-alert" />}
                </button>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="research-card">
            <div className="research-card-top">
              <FlaskConical size={15} />
              <span className="badge badge-teal">Live SaaS</span>
            </div>
            <strong>Research Engine Active</strong>
            <p>Dynamic scoring, dynamic XAI, fairness audit enabled.</p>
          </div>

          <button className="button reset" onClick={() => { resetDemo(); notify('Demo state reset to defaults') }}>
            <RotateCcw size={14} /> Reset workspace
          </button>

          <div className="user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="avatar small">{initials}</div>
              <div>
                <strong>{user?.name || 'Researcher'}</strong>
                <small>{user?.role || 'RESEARCHER'}</small>
              </div>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              style={{ padding: '6px', color: 'var(--muted-foreground)' }}
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
            <strong>{pathname.split('/')[1]?.toUpperCase() || 'DASHBOARD'}</strong>
          </div>

          <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Inline Search Bar with Anchored Dropdown */}
            <PopoverDropdown
              isOpen={activeDropdown === 'search'}
              onClose={closeDropdown}
              align="left"
              width="420px"
              trigger={
                <div
                  className="search"
                  style={{
                    position: 'relative',
                    cursor: 'text',
                    width: '260px',
                    height: '34px',
                    borderColor: activeDropdown === 'search' ? 'var(--primary)' : 'var(--border)',
                    boxShadow: activeDropdown === 'search' ? '0 0 0 1px var(--primary)' : 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onClick={() => {
                    if (activeDropdown !== 'search') toggleDropdown('search')
                  }}
                >
                  <Search size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  <input
                    placeholder="Search candidates, jobs, skills..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      if (activeDropdown !== 'search') setActiveDropdown('search')
                    }}
                    onFocus={() => {
                      if (activeDropdown !== 'search') setActiveDropdown('search')
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '12px',
                    }}
                    aria-label="Search candidates and requisitions"
                    aria-haspopup="listbox"
                    aria-expanded={activeDropdown === 'search'}
                  />
                  {searchQuery ? (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setSearchQuery('')
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--muted-foreground)' }}
                    >
                      <X size={12} />
                    </button>
                  ) : (
                    <kbd
                      style={{
                        fontSize: '10px',
                        background: 'var(--muted)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        color: 'var(--muted-foreground)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      Ctrl+K
                    </kbd>
                  )}
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '380px' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ fontWeight: 700, letterSpacing: '0.06em', color: 'var(--muted-foreground)', fontSize: '10px' }}>
                    {searchQuery ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"` : 'QUICK SUGGESTIONS & RECENT SEARCHES'}
                  </small>
                  {searchQuery && (
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      {matchingCandidates.length + matchingJobs.length} results
                    </span>
                  )}
                </div>

                <div style={{ overflowY: 'auto', padding: '6px 0' }}>
                  {/* Candidates */}
                  <div style={{ padding: '4px 14px 2px', fontSize: '10px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                    CANDIDATES ({matchingCandidates.length})
                  </div>
                  {matchingCandidates.length === 0 ? (
                    <div style={{ padding: '8px 14px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      No matching candidates found
                    </div>
                  ) : (
                    matchingCandidates.slice(0, 4).map(c => (
                      <Link
                        key={c.id}
                        href={`/candidates/${c.id}`}
                        onClick={closeDropdown}
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--foreground)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <div className="avatar small" style={{ width: '26px', height: '26px', fontSize: '10px' }}>
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '12px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {c.name}
                          </strong>
                          <small style={{ color: 'var(--muted-foreground)', fontSize: '11px', display: 'block' }}>
                            {c.id} · {c.skills.slice(0, 3).join(', ')}
                          </small>
                        </div>
                        <span className="badge badge-teal" style={{ fontSize: '9px' }}>
                          Candidate
                        </span>
                      </Link>
                    ))
                  )}

                  {/* Jobs */}
                  <div style={{ padding: '10px 14px 2px', fontSize: '10px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                    REQUISITIONS & JOBS ({matchingJobs.length})
                  </div>
                  {matchingJobs.length === 0 ? (
                    <div style={{ padding: '8px 14px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      No matching requisitions found
                    </div>
                  ) : (
                    matchingJobs.slice(0, 3).map(j => (
                      <Link
                        key={j.id}
                        href={`/jobs/${j.id}`}
                        onClick={closeDropdown}
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--foreground)',
                        }}
                        className="dropdown-item-hover"
                      >
                        <BriefcaseBusiness size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '12px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {j.title}
                          </strong>
                          <small style={{ color: 'var(--muted-foreground)', fontSize: '11px', display: 'block' }}>
                            {j.id} · {j.department}
                          </small>
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: '9px' }}>
                          Job
                        </span>
                      </Link>
                    ))
                  )}
                </div>

                <div style={{ padding: '8px 14px', background: 'var(--muted)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    href="/candidates"
                    onClick={closeDropdown}
                    style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View All in Talent Pool →
                  </Link>
                  <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>ESC to close</small>
                </div>
              </div>
            </PopoverDropdown>

            {/* Start Streaming Popover (Dedicated Inline Dropdown) */}
            <PopoverDropdown
              isOpen={activeDropdown === 'startStreaming'}
              onClose={closeDropdown}
              align="right"
              width="320px"
              trigger={
                <button
                  className="button primary"
                  onClick={() => toggleDropdown('startStreaming')}
                  aria-haspopup="dialog"
                  aria-expanded={activeDropdown === 'startStreaming'}
                  aria-label="Start streaming configuration"
                  style={{ gap: '6px', padding: '7px 12px', fontSize: '12px' }}
                >
                  <Video size={14} />
                  <span>Start Streaming</span>
                </button>
              }
            >
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>Start a Live Stream</strong>
                    <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Broadcast research demos & audits</small>
                  </div>
                </div>

                <form onSubmit={handleStartNewStream} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label htmlFor="stream-title-input" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Stream Title
                    </label>
                    <input
                      id="stream-title-input"
                      type="text"
                      placeholder="e.g., Live XAI Evaluation Walkthrough"
                      value={newStreamTitle}
                      aria-invalid={!!streamTitleError}
                      aria-describedby={streamTitleError ? 'stream-title-error' : undefined}
                      onChange={e => {
                        setNewStreamTitle(e.target.value)
                        if (streamTitleError) {
                          setStreamTitleError('')
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${streamTitleError ? '#ef4444' : 'var(--border)'}`,
                        fontSize: '12px',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                      }}
                      autoFocus
                    />
                    {streamTitleError && (
                      <p
                        id="stream-title-error"
                        role="alert"
                        style={{
                          color: '#ef4444',
                          fontSize: '11px',
                          marginTop: '5px',
                          marginBottom: '0',
                          lineHeight: '1.3',
                          fontWeight: 500,
                        }}
                      >
                        {streamTitleError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Category
                    </label>
                    <select
                      value={newStreamCategory}
                      onChange={e => setNewStreamCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        fontSize: '12px',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                      }}
                    >
                      <option value="Research Demo">Research Demo</option>
                      <option value="Audit Lab">Fairness & Bias Audit Lab</option>
                      <option value="Candidate Screening">Live Candidate Screening</option>
                      <option value="Algorithm Walkthrough">Algorithm & Model Reranking</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Visibility
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(['Public', 'Consortium Only'] as const).map(vis => (
                        <button
                          type="button"
                          key={vis}
                          onClick={() => setNewStreamVisibility(vis)}
                          className={`button ${newStreamVisibility === vis ? 'primary' : 'outline'}`}
                          style={{ flex: 1, padding: '6px 8px', fontSize: '11px', justifyContent: 'center' }}
                        >
                          {vis}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="button outline"
                      onClick={closeDropdown}
                      style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button primary"
                      style={{ flex: 1.5, justifyContent: 'center', fontSize: '12px', gap: '6px' }}
                    >
                      <Radio size={13} /> Go Live Now
                    </button>
                  </div>
                </form>
              </div>
            </PopoverDropdown>

            {/* Quick Actions Dropdown */}
            <PopoverDropdown
              isOpen={activeDropdown === 'quickActions'}
              onClose={closeDropdown}
              align="right"
              width="240px"
              trigger={
                <button
                  className="button outline"
                  onClick={() => toggleDropdown('quickActions')}
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === 'quickActions'}
                  aria-label="Quick Actions"
                >
                  <Plus size={14} /> Actions <ChevronDown size={12} />
                </button>
              }
            >
              <div style={{ padding: '8px' }}>
                <div style={{ padding: '6px 8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>
                  QUICK RESEARCH ACTIONS
                </div>
                <Link
                  href="/screening"
                  onClick={closeDropdown}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--foreground)' }}
                  className="dropdown-item-hover"
                >
                  <Gauge size={14} color="var(--primary)" /> Run Candidate Screening
                </Link>
                <Link
                  href="/jobs"
                  onClick={closeDropdown}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--foreground)' }}
                  className="dropdown-item-hover"
                >
                  <BriefcaseBusiness size={14} color="var(--primary)" /> Create Requisition
                </Link>
                <Link
                  href="/experiments"
                  onClick={closeDropdown}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--foreground)' }}
                  className="dropdown-item-hover"
                >
                  <FlaskConical size={14} color="var(--primary)" /> Launch Experiment Benchmark
                </Link>
                <Link
                  href="/fairness"
                  onClick={closeDropdown}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--foreground)' }}
                  className="dropdown-item-hover"
                >
                  <ShieldCheck size={14} color="var(--primary)" /> Audit Cohort Disparities
                </Link>
              </div>
            </PopoverDropdown>

            {/* Live Streaming Popover (Sessions List) */}
            <PopoverDropdown
              isOpen={activeDropdown === 'streaming'}
              onClose={closeDropdown}
              align="right"
              width="340px"
              trigger={
                <button
                  className={`button live-button ${simulationRunning ? 'primary' : ''}`}
                  onClick={() => toggleDropdown('streaming')}
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === 'streaming'}
                  aria-label="Live streaming and simulation"
                >
                  <Radio size={14} className={simulationRunning ? 'animate-pulse' : ''} />
                  {simulationRunning ? 'Live Active' : 'Live Streams'}
                </button>
              }
            >
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: simulationRunning ? '#10b981' : '#ef4444' }} />
                    <strong style={{ fontSize: '13px' }}>Simulation & Streams</strong>
                  </div>
                  <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                    {simulationRunning ? 'RUNNING' : 'PAUSED'}
                  </span>
                </div>

                <div style={{ padding: '10px', background: 'var(--muted)', borderRadius: '6px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <small style={{ fontSize: '11px', fontWeight: 600 }}>Synthetic Stream Simulator</small>
                    <button
                      onClick={() => {
                        const next = !simulationRunning
                        setSimulationRunning(next)
                        notify(next ? 'Live simulation started' : 'Live simulation paused')
                      }}
                      className="button primary"
                      style={{ padding: '4px 8px', fontSize: '11px', height: 'auto' }}
                    >
                      {simulationRunning ? <Pause size={12} /> : <Play size={12} />}
                      {simulationRunning ? 'Pause' : 'Start'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: '1.4' }}>
                    Emulates continuous applicant ingestion and live model reranking.
                  </p>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  ACTIVE BROADCASTS ({liveSessions.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liveSessions.map(session => (
                    <div
                      key={session.id}
                      style={{
                        padding: '10px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} /> {session.status}
                        </span>
                        <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>👥 {session.viewers} viewers</small>
                      </div>
                      <strong style={{ fontSize: '12px' }}>{session.title}</strong>
                      <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Host: {session.host}</small>
                      <button
                        className="button outline"
                        onClick={() => {
                          notify(`Connected to stream: ${session.title}`)
                          closeDropdown()
                        }}
                        style={{ marginTop: '6px', padding: '4px 8px', fontSize: '11px', justifyContent: 'center' }}
                      >
                        Join Stream Session
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverDropdown>

            <span className="status-dot">
              <i /> System Online
            </span>

            {/* Notifications Popover */}
            <PopoverDropdown
              isOpen={activeDropdown === 'notifications'}
              onClose={closeDropdown}
              align="right"
              width="360px"
              trigger={
                <button
                  className="icon-button"
                  style={{ position: 'relative' }}
                  aria-label="Notifications"
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === 'notifications'}
                  onClick={() => toggleDropdown('notifications')}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                      }}
                    />
                  )}
                </button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>Notifications</strong>
                    {unreadCount > 0 && (
                      <span className="badge badge-amber" style={{ fontSize: '9px', padding: '2px 5px' }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px 0' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '12px' }}>
                      No notifications available
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          borderBottom: '1px solid var(--border)',
                          background: n.read ? 'transparent' : 'oklch(0.985 0.01 220)',
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              display: 'inline-block',
                              background: n.read ? 'transparent' : '#3b82f6',
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <strong style={{ fontSize: '12px' }}>{n.title}</strong>
                            <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{n.time}</small>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: '1.4' }}>
                            {n.message}
                          </p>
                        </div>
                        <button
                          onClick={e => dismissNotification(n.id, e)}
                          className="icon-button"
                          style={{ width: '20px', height: '20px', border: 'none', background: 'transparent', padding: 0 }}
                          title="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <Link
                    href="/dashboard"
                    onClick={closeDropdown}
                    style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View All Audit Alerts
                  </Link>
                </div>
              </div>
            </PopoverDropdown>

            {/* Messages Popover */}
            <PopoverDropdown
              isOpen={activeDropdown === 'messages'}
              onClose={closeDropdown}
              align="right"
              width="360px"
              trigger={
                <button
                  className="icon-button"
                  style={{ position: 'relative' }}
                  aria-label="Messages"
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === 'messages'}
                  onClick={() => toggleDropdown('messages')}
                >
                  <MessageSquare size={17} />
                  {unreadMessageCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                      }}
                    />
                  )}
                </button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>Messages & Discussions</strong>
                    {unreadMessageCount > 0 && (
                      <span className="badge badge-blue" style={{ fontSize: '9px', padding: '2px 5px' }}>
                        {unreadMessageCount} new
                      </span>
                    )}
                  </div>
                  {unreadMessageCount > 0 && (
                    <button
                      onClick={markAllMessagesAsRead}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px 0' }}>
                  {messages.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '12px' }}>
                      No messages available
                    </div>
                  ) : (
                    messages.map(m => (
                      <div
                        key={m.id}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          borderBottom: '1px solid var(--border)',
                          background: m.read ? 'transparent' : 'oklch(0.985 0.01 220)',
                        }}
                      >
                        <div className="avatar small" style={{ width: '28px', height: '28px', fontSize: '10px', flexShrink: 0 }}>
                          {m.avatar}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <strong style={{ fontSize: '12px' }}>{m.sender}</strong>
                            <small style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{m.time}</small>
                          </div>
                          <small style={{ color: 'var(--primary)', fontSize: '10px', display: 'block', marginBottom: '2px' }}>
                            {m.role}
                          </small>
                          <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: '1.4', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {m.preview}
                          </p>
                        </div>
                        <button
                          onClick={e => dismissMessage(m.id, e)}
                          className="icon-button"
                          style={{ width: '20px', height: '20px', border: 'none', background: 'transparent', padding: 0, flexShrink: 0 }}
                          title="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <Link
                    href="/dashboard"
                    onClick={closeDropdown}
                    style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View All Research Discussions
                  </Link>
                </div>
              </div>
            </PopoverDropdown>

            {/* Profile Popover */}
            <PopoverDropdown
              isOpen={activeDropdown === 'profile'}
              onClose={closeDropdown}
              align="right"
              width="260px"
              trigger={
                <button
                  onClick={() => toggleDropdown('profile')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === 'profile'}
                  aria-label="User profile menu"
                >
                  <div className="avatar small">{initials}</div>
                </button>
              }
            >
              <div style={{ padding: '14px' }}>
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', display: 'block' }}>{user?.name || 'Researcher'}</strong>
                  <small style={{ color: 'var(--muted-foreground)', display: 'block', fontSize: '11px' }}>
                    {user?.email || 'user@prism-ai.org'}
                  </small>
                  <span className="badge badge-teal" style={{ marginTop: '6px', fontSize: '10px' }}>
                    {user?.role || 'RESEARCHER'}
                  </span>
                </div>

                <Link
                  href="/settings"
                  onClick={closeDropdown}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '12px', color: 'var(--foreground)' }}
                >
                  <Settings size={14} /> Profile & System Settings
                </Link>

                <button
                  onClick={() => {
                    closeDropdown()
                    logout()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 0 0 0',
                    marginTop: '6px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '12px',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <LogOut size={14} /> Sign Out of PRISM
                </button>
              </div>
            </PopoverDropdown>
          </div>
        </header>

        <div className="content">
          {children}

          <footer>
            <span>PRISM v1.3.2 · SaaS Recruitment Platform</span>
            <span>Human-in-the-Loop · Research Prototype</span>
          </footer>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast" role="status">
          <Check size={15} />
          {toastMessage}
        </div>
      )}
    </div>
  )
}
