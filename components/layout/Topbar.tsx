'use client'

import React from 'react'
import { Menu, Play, Pause, Bell } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

interface TopbarProps {
  currentView: string
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  onNotify: (msg: string) => void
}

export function Topbar({ currentView, mobileOpen, setMobileOpen, onNotify }: TopbarProps) {
  const { simulationRunning, setSimulationRunning } = useApp()

  return (
    <header className="topbar">
      <button
        className="menu-button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      <div className="crumb">
        <span>Hiring research</span>
        <span>/</span>
        <strong>{currentView}</strong>
      </div>

      <div className="top-actions">
        <button
          className={`button live-button ${simulationRunning ? 'primary' : ''}`}
          onClick={() => {
            const nextState = !simulationRunning
            setSimulationRunning(nextState)
            onNotify(nextState ? 'Demo simulation resumed' : 'Demo simulation paused')
          }}
        >
          {simulationRunning ? <Pause size={14} /> : <Play size={14} />}
          {simulationRunning ? 'Pause demo' : 'Resume demo'}
        </button>

        <span className="status-dot">
          <i /> System status
        </span>

        <button
          className="icon-button"
          aria-label="Notifications"
          onClick={() => onNotify('No new notifications')}
        >
          <Bell size={17} />
        </button>

        <div className="avatar small">AM</div>
      </div>
    </header>
  )
}
