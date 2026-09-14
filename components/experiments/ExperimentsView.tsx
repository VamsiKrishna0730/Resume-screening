'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, Code, Plus, Play, Check, X, RefreshCw, Layers } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import {
  exportModelComparisonCSV,
  exportAblationCSV,
  exportFairnessCSV,
  exportFeedbackHistoryCSV,
  generateExperimentSummaryJSON,
} from '@/lib/experiments/exporter'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export function ExperimentsView() {
  const { experimentsList, ablationList, fairnessReport, modelsList, addActivityEvent } = useApp()
  const [selected, setSelected] = useState<string[]>(['Hybrid AI', 'Full Adaptive Framework'])
  const [createOpen, setCreateOpen] = useState(false)
  const [expLifecycle, setExpLifecycle] = useState<'IDLE' | 'QUEUED' | 'RUNNING' | 'COMPLETED'>('IDLE')
  const [toastMsg, setToastMsg] = useState('')

  // New experiment form state
  const [expName, setExpName] = useState('Custom PRISM Cross-Validation')
  const [expModel, setExpModel] = useState('Full Adaptive Framework')
  const [expDataset, setExpDataset] = useState('Synthetic Research Benchmark v1.3')

  const chartHeights = [68, 74, 79, 83, 86, 88, 91]

  const notify = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify(`${filename} downloaded`)
  }

  const handleExportCSV = () => {
    const csvContent = exportModelComparisonCSV(experimentsList)
    downloadFile('model_comparison.csv', csvContent, 'text/csv')
  }

  const handleExportJSON = () => {
    const jsonContent = generateExperimentSummaryJSON(experimentsList, ablationList, fairnessReport, modelsList)
    downloadFile('experiment_summary.json', jsonContent, 'application/json')
  }

  const handleRunExperiment = () => {
    setExpLifecycle('QUEUED')
    setTimeout(() => {
      setExpLifecycle('RUNNING')
      setTimeout(() => {
        setExpLifecycle('COMPLETED')
        addActivityEvent('Experiment execution finished', expName, 'Pass')
        notify(`Experiment '${expName}' completed successfully`)
      }, 1500)
    }, 600)
  }

  const handleCreateSubmit = () => {
    if (!expName.trim()) return
    setCreateOpen(false)
    handleRunExperiment()
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE / BENCHMARKING</p>
          <h1>Experiment Lab & Ablation Studies</h1>
          <p className="lede">Reproducible evaluation benchmarks comparing ranking architectures against baseline information retrieval models.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="button outline" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> New Experiment
          </button>
          <button className="button outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button className="button outline" onClick={handleExportJSON}>
            <Code size={14} /> Export JSON
          </button>
          <button
            className="button primary"
            onClick={handleRunExperiment}
            disabled={expLifecycle === 'QUEUED' || expLifecycle === 'RUNNING'}
          >
            <Play size={14} /> {expLifecycle === 'RUNNING' ? 'Evaluating...' : expLifecycle === 'QUEUED' ? 'Queued...' : 'Run Benchmark'}
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="toast" role="status" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
          <Check size={15} /> {toastMsg}
        </div>
      )}

      {expLifecycle !== 'IDLE' && (
        <div className="notice" style={{ marginTop: '16px' }}>
          <RefreshCw size={16} className={expLifecycle === 'RUNNING' ? 'spin' : ''} />
          <div>
            <strong>Experiment Lifecycle: {expLifecycle}</strong>
            <p>Evaluating strategy: {expModel} on {expDataset} · Status: {expLifecycle}</p>
          </div>
          <Badge t={expLifecycle === 'COMPLETED' ? 'teal' : expLifecycle === 'RUNNING' ? 'amber' : 'neutral'}>
            {expLifecycle}
          </Badge>
        </div>
      )}

      <div className="panel" style={{ marginTop: '16px' }}>
        <div className="tabs">
          {experimentsList.map(e => (
            <button
              className={selected.includes(e.name) ? 'tab active' : 'tab'}
              key={e.name}
              onClick={() =>
                setSelected(s => (s.includes(e.name) ? s.filter(x => x !== e.name) : [...s, e.name]))
              }
            >
              {e.name}
            </button>
          ))}
        </div>

        <div className="chart-bars" style={{ marginTop: '16px' }}>
          {experimentsList.map((e, i) => (
            <div key={e.name}>
              <span style={{ height: `${chartHeights[i]}%` }} />
              <small>{e.name.replace('Full Adaptive Framework', 'Full').replace('Sentence-BERT', 'SBERT')}</small>
            </div>
          ))}
        </div>

        <div className="metric-cards" style={{ marginTop: '16px' }}>
          <div>
            <small>Accuracy</small>
            <strong>0.91</strong>
          </div>
          <div>
            <small>Precision@5</small>
            <strong>0.88</strong>
          </div>
          <div>
            <small>NDCG@10</small>
            <strong>0.84</strong>
          </div>
        </div>
        <p className="microcopy" style={{ marginTop: '8px' }}>
          Selected for comparison: {selected.length ? selected.join(' · ') : 'none'}. Evaluated on Synthetic Research Benchmark.
        </p>
      </div>

      <div className="panel table-panel" style={{ marginTop: '20px' }}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">ABLATION BENCHMARK</p>
            <h2>Architectural Ablation Matrix</h2>
          </div>
          <Badge t="teal">7 Configurations</Badge>
        </div>
        <table>
          <thead>
            <tr>
              <th>Configuration</th>
              <th>Semantic</th>
              <th>Structured</th>
              <th>XAI</th>
              <th>Fairness</th>
              <th>Feedback</th>
              <th>F1</th>
              <th>NDCG@10</th>
            </tr>
          </thead>
          <tbody>
            {ablationList.map(row => (
              <tr key={row.configuration}>
                <td><strong>{row.configuration}</strong></td>
                <td>{row.semantic ? '✓' : '—'}</td>
                <td>{row.structured ? '✓' : '—'}</td>
                <td>{row.xai ? '✓' : '—'}</td>
                <td>{row.fairness ? '✓' : '—'}</td>
                <td>{row.feedback ? '✓' : '—'}</td>
                <td><strong>{row.f1}</strong></td>
                <td>{row.ndcg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Experiment Modal */}
      {createOpen && (
        <div className="drawer-backdrop" onClick={() => setCreateOpen(false)} role="dialog" aria-modal="true">
          <div className="panel" onClick={e => e.stopPropagation()} style={{ width: 'min(480px, 92%)', margin: 'auto', background: 'var(--card)', borderRadius: '8px', padding: '24px' }}>
            <div className="panel-head">
              <h2>Configure New Experiment</h2>
              <button className="icon-button" onClick={() => setCreateOpen(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <div>
                <small className="eyebrow">EXPERIMENT NAME</small>
                <input style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} value={expName} onChange={e => setExpName(e.target.value)} />
              </div>
              <div>
                <small className="eyebrow">TARGET ARCHITECTURE</small>
                <select style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} value={expModel} onChange={e => setExpModel(e.target.value)}>
                  {experimentsList.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <small className="eyebrow">BENCHMARK DATASET</small>
                <input style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} value={expDataset} onChange={e => setExpDataset(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="button" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="button primary" onClick={handleCreateSubmit}>Start Experiment Run</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
