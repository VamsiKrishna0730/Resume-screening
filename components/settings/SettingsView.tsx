'use client'

import React from 'react'
import { BookOpen, SlidersHorizontal } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export function SettingsView() {
  const { weights, setWeights, simulationSpeed, setSimulationSpeed, simulationRunning, setSimulationRunning } = useApp()

  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: val,
    }))
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE</p>
          <h1>Research settings</h1>
          <p className="lede">Configure transparent demo assumptions, matching weights, and review safeguards.</p>
        </div>
        <Badge t="teal">Live State Connected</Badge>
      </div>

      <div className="settings-grid">
        <div className="panel settings-card">
          <h2>
            <SlidersHorizontal size={16} /> Matching Weights
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginBottom: '14px' }}>
            Adjusting weights immediately recalculates hybrid scores and re-ranks all candidates.
          </p>

          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Lexical Weight ({Math.round(weights.lexical * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.lexical}
              onChange={e => handleWeightChange('lexical', parseFloat(e.target.value))}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Semantic Weight ({Math.round(weights.semantic * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.semantic}
              onChange={e => handleWeightChange('semantic', parseFloat(e.target.value))}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Skills Weight ({Math.round(weights.skills * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.skills}
              onChange={e => handleWeightChange('skills', parseFloat(e.target.value))}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Experience Weight ({Math.round(weights.experience * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="0.4"
              step="0.05"
              value={weights.experience}
              onChange={e => handleWeightChange('experience', parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="panel settings-card">
          <h2>Demo & Simulation</h2>
          <label>
            <span>Live simulation active</span>
            <input
              type="checkbox"
              checked={simulationRunning}
              onChange={e => setSimulationRunning(e.target.checked)}
            />
          </label>
          <label>
            <span>Simulation speed</span>
            <select
              value={simulationSpeed}
              onChange={e => setSimulationSpeed(e.target.value as 'Slow' | 'Normal' | 'Fast')}
            >
              <option value="Slow">Slow (5.0s)</option>
              <option value="Normal">Normal (2.6s)</option>
              <option value="Fast">Fast (1.2s)</option>
            </select>
          </label>
          <label>
            <span>Synthetic audit dataset</span>
            <input type="checkbox" defaultChecked disabled />
          </label>
        </div>

        <div className="panel settings-card">
          <h2>Fairness Safeguards</h2>
          <label>
            <span>Group parity monitoring</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label>
            <span>Audit threshold · 0.10</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label>
            <span>Human-in-the-loop requirement</span>
            <input type="checkbox" defaultChecked disabled />
          </label>
        </div>

        <div className="panel settings-card">
          <h2>Explainability Safeguards</h2>
          <label>
            <span>Feature contributions shown</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label>
            <span>Skill gaps highlighted</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label>
            <span>Confidence indicators shown</span>
            <input type="checkbox" defaultChecked />
          </label>
        </div>
      </div>

      <div className="panel guide" style={{ marginTop: '20px' }}>
        <h2>
          <BookOpen size={16} /> Presentation guide
        </h2>
        <p>
          1. Select a job · 2. Review candidate scores & rankings · 3. Open Candidate Drawer · 4. Inspect dynamic XAI & fairness · 5. Advance or hold · 6. Submit feedback · 7. Run adaptive retraining · 8. Compare experiments & models.
        </p>
      </div>
    </>
  )
}
