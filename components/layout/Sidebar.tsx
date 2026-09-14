'use client'

import React from 'react'
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
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

const navItems = [
  ['Overview', LayoutDashboard],
  ['Screening', Gauge],
  ['Candidates', Users],
  ['Jobs', BriefcaseBusiness],
  ['Experiments', FlaskConical],
  ['Fairness', ShieldCheck],
  ['Feedback', Send],
  ['Models', BarChart3],
  ['Settings', Settings],
] as const

interface SidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function Sidebar({ currentView, setCurrentView, mobileOpen, setMobileOpen }: SidebarProps) {
  const { resetDemo } = useApp()

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={17} />
        </div>
        <div>
          <strong>PRISM</strong>
          <small>research console</small>
        </div>
      </div>

      <div className="workspace">
        <span className="workspace-dot" /> Hiring research <ChevronDown size={13} />
      </div>

      <nav>
        {navItems.map(([label, Icon]) => {
          const targetView = label === 'Overview' ? 'Screening' : label
          const isActive = currentView === targetView
          return (
            <button
              key={label}
              className={isActive ? 'active' : ''}
              onClick={() => {
                setCurrentView(targetView)
                setMobileOpen(false)
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === 'Fairness' && <i className="nav-alert" />}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="research-card">
          <div className="research-card-top">
            <FlaskConical size={15} />
            <span className="badge badge-amber">Synthetic</span>
          </div>
          <strong>Research mode enabled</strong>
          <p>Deterministic algorithms · no external services.</p>
        </div>

        <button className="button reset" onClick={resetDemo}>
          <RotateCcw size={14} /> Reset demo
        </button>

        <div className="user">
          <div className="avatar small">AM</div>
          <div>
            <strong>Alex Morgan</strong>
            <small>Research lead</small>
          </div>
        </div>
      </div>
    </aside>
  )
}
