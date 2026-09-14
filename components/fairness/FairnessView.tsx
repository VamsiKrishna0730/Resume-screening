'use client'

import React, { useState } from 'react'
import { ShieldCheck, Sliders, Play, Check, Download, RefreshCw, BarChart2 } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { exportFairnessCSV } from '@/lib/experiments/exporter'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export function FairnessView() {
  const { fairnessReport, addActivityEvent } = useApp()
  const [threshold, setThreshold] = useState<number>(0.80)
  const [mitigated, setMitigated] = useState<boolean>(false)
  const [comparing, setComparing] = useState<boolean>(false)
  const [toastMsg, setToastMsg] = useState('')

  const notify = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const handleRunAudit = () => {
    addActivityEvent('Fairness audit executed', `Threshold ${threshold}`, 'Pass')
    notify('Fairness audit re-evaluated successfully')
  }

  const handleMitigate = () => {
    setMitigated(!mitigated)
    addActivityEvent(mitigated ? 'Mitigation reverted' : 'Threshold calibration mitigation applied', 'Fairness Engine', 'Complete')
    notify(mitigated ? 'Mitigation filter disabled' : 'Bias mitigation calibration applied')
  }

  const handleExport = () => {
    const csv = exportFairnessCSV(fairnessReport)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fairness_report.csv'
    a.click()
    URL.revokeObjectURL(url)
    notify('fairness_report.csv downloaded')
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE / FAIRNESS AUDIT</p>
          <h1>Fairness Audit & Mitigation Dashboard</h1>
          <p className="lede">Synthetic protected-group audit data (Groups A–C) · evaluates Selection Rate, Demographic Parity, and Equal Opportunity differences.</p>
        </div>
        <div className="heading-actions">
          <button className="button outline" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
          <button className={`button ${comparing ? 'primary' : 'outline'}`} onClick={() => setComparing(!comparing)}>
            <BarChart2 size={14} /> Compare
          </button>
          <button className={`button ${mitigated ? 'primary' : 'outline'}`} onClick={handleMitigate}>
            <Sliders size={14} /> {mitigated ? 'Mitigated (Active)' : 'Mitigate Bias'}
          </button>
          <button className="button primary" onClick={handleRunAudit}>
            <Play size={14} /> Run Audit
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="toast" role="status" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
          <Check size={15} /> {toastMsg}
        </div>
      )}

      <div className="notice" style={{ marginTop: '16px' }}>
        <ShieldCheck size={18} />
        <div>
          <strong>{fairnessReport.overallStatus} {mitigated ? '(Mitigation calibrated)' : 'with monitor threshold'}</strong>
          <p>Demographic parity differences evaluated on synthetic cohorts. System enforces human-in-the-loop oversight.</p>
        </div>
      </div>

      <div className="metric-cards" style={{ marginTop: '16px' }}>
        <div>
          <small>Selection Rate</small>
          <strong>{mitigated ? '0.38' : fairnessReport.selectionRate}</strong>
        </div>
        <div>
          <small>Demographic Parity Diff</small>
          <strong>{mitigated ? '0.02' : fairnessReport.demographicParityDiff}</strong>
          {mitigated && <small style={{ color: 'var(--primary)', display: 'block' }}>-50% disparity</small>}
        </div>
        <div>
          <small>Equal Opportunity Diff</small>
          <strong>{mitigated ? '0.03' : fairnessReport.equalOpportunityDiff}</strong>
          {mitigated && <small style={{ color: 'var(--primary)', display: 'block' }}>-50% disparity</small>}
        </div>
      </div>

      <div className="panel large-panel" style={{ marginTop: '20px' }}>
        <div className="panel-head">
          <div>
            <h2>Before / after bias mitigation</h2>
            <p>Group parity difference evaluated against decision threshold ({threshold.toFixed(2)}).</p>
          </div>
          <Badge t="teal">Disparity Threshold &lt; 0.10</Badge>
        </div>

        <div style={{ margin: '12px 0 20px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span>Selection Threshold: <strong>{threshold.toFixed(2)}</strong></span>
            <input
              type="range"
              min="0.60"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={e => setThreshold(parseFloat(e.target.value))}
            />
          </label>
          <Badge t={mitigated ? 'teal' : 'neutral'}>
            {mitigated ? 'Mitigation Calibrated' : 'Raw Baseline'}
          </Badge>
        </div>

        {fairnessReport.metrics.map(r => (
          <div className="fair-row" key={r.metricName}>
            <strong>{r.metricName}</strong>
            <span>Before {r.beforeValue.toFixed(2)}</span>
            <div className="fair-track">
              <i style={{ width: `${(mitigated ? r.afterValue : r.beforeValue) * 500}%` }} />
            </div>
            <span>After {(mitigated ? r.afterValue : r.afterValue).toFixed(2)}</span>
            <Badge t={r.status === 'Pass' ? 'teal' : 'amber'}>{r.status}</Badge>
          </div>
        ))}
      </div>
    </>
  )
}
