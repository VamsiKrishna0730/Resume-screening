'use client'

import React, { useState } from 'react'
import { BriefcaseBusiness, FileText, Sparkles, Check, Upload, SlidersHorizontal } from 'lucide-react'
import { Candidate } from '@/lib/matching/types'
import { useApp } from '@/lib/context/AppContext'
import { ScreeningKPIs } from './ScreeningKPIs'
import { PipelinePanel } from './PipelinePanel'
import { CandidateTable } from './CandidateTable'
import { ResumeUploadModal } from '../parsing/ResumeUploadModal'
import { CandidateDrawer } from '../candidates/CandidateDrawer'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

interface ScreeningViewProps {
  onSelectCandidate?: (c: Candidate) => void
  onNotify?: (msg: string, subject?: string) => void
}

export function ScreeningView({
  onSelectCandidate = () => {},
  onNotify = () => {},
}: ScreeningViewProps = {}) {
  const { jobsList, selectedJobId, setSelectedJobId, selectedJob, activitiesList, weights, setWeights, editJob } = useApp()
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null)
  const [weightsOpen, setWeightsOpen] = useState(false)

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE / SCREENING</p>
          <h1>Candidate screening</h1>
          <p className="lede">AI-assisted candidate-job matching for research evaluation · synthetic data · recruiter review required.</p>
        </div>
        <div className="heading-actions">
          <button className="button outline" onClick={() => setUploadModalOpen(true)}>
            <Upload size={16} /> Parse Resume
          </button>
          <button className="button outline" onClick={() => onNotify('Review export prepared', 'Screening queue')}>
            <FileText size={16} /> Export review
          </button>
          <button className="button primary" onClick={() => onNotify('Screening run completed', selectedJob.id)}>
            <Sparkles size={16} /> Run screening
          </button>
        </div>
      </div>

      <div className="job-strip">
        <label className="job-select">
          <BriefcaseBusiness size={17} />
          <div>
            <small>ACTIVE JOB</small>
            <select
              aria-label="Select job"
              value={selectedJobId}
              onChange={e => {
                setSelectedJobId(e.target.value)
                onNotify('Job selected & candidates re-scored', e.target.value)
              }}
            >
              {jobsList.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.id})
                </option>
              ))}
            </select>
          </div>
        </label>
        <div className="job-meta">
          <span>{selectedJob.id}</span>
          <span>{selectedJob.candidates} synthetic candidates</span>
          <Badge t="teal">Research mode</Badge>
        </div>
      </div>

      <ScreeningKPIs />

      {/* Admin CGPA Screening Requirement Control Bar */}
      <div className="panel" style={{ marginTop: '16px', background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>FIRST-STAGE ELIGIBILITY FILTER</span>
              <Badge t={selectedJob.enableCGPAScreening !== false && selectedJob.minimumCGPA ? 'teal' : 'neutral'}>
                {selectedJob.enableCGPAScreening !== false && selectedJob.minimumCGPA
                  ? `Active: ≥ ${selectedJob.minimumCGPA} / ${selectedJob.cgpaScale || 10}`
                  : 'Screening: Disabled'}
              </Badge>
            </div>
            <h2 style={{ fontSize: '15px', margin: '4px 0 2px' }}>Minimum CGPA Resume Screening</h2>
            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', margin: 0 }}>
              Automatically filter and flag candidate resumes based on extracted CGPA before downstream matching.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={selectedJob.enableCGPAScreening !== false && selectedJob.minimumCGPA !== undefined}
                onChange={e => {
                  const enable = e.target.checked
                  editJob(selectedJob.id, {
                    enableCGPAScreening: enable,
                    minimumCGPA: enable ? (selectedJob.minimumCGPA || 7.0) : undefined,
                    cgpaScale: selectedJob.cgpaScale || 10,
                    cgpaMode: 'HARD',
                  })
                  onNotify(enable ? 'CGPA Screening enabled for active job' : 'CGPA Screening disabled', selectedJob.title)
                }}
              />
              <span>Enable CGPA Screening</span>
            </label>

            {(selectedJob.enableCGPAScreening !== false && selectedJob.minimumCGPA !== undefined) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Min:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    style={{ width: '65px', padding: '4px 6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', background: 'var(--card)' }}
                    value={selectedJob.minimumCGPA}
                    onChange={e => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val)) {
                        editJob(selectedJob.id, { minimumCGPA: val })
                      }
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Scale:</span>
                  <select
                    style={{ padding: '4px 6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', background: 'var(--card)' }}
                    value={selectedJob.cgpaScale || 10}
                    onChange={e => {
                      const scale = parseFloat(e.target.value)
                      if (!isNaN(scale)) {
                        editJob(selectedJob.id, { cgpaScale: scale })
                      }
                    }}
                  >
                    <option value="10">/ 10</option>
                    <option value="4">/ 4</option>
                    <option value="5">/ 5</option>
                    <option value="100">/ 100</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PipelinePanel />

      <div className="panel" style={{ marginTop: '16px', marginBottom: '16px' }}>
        <div className="panel-head" style={{ cursor: 'pointer' }} onClick={() => setWeightsOpen(!weightsOpen)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} />
            <div>
              <h2 style={{ fontSize: '14px', margin: 0 }}>Hybrid Matching Weight Tuner</h2>
              <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', margin: 0 }}>
                Adjust weights to observe live recalculation of candidate scores and rankings.
              </p>
            </div>
          </div>
          <button className="button outline" style={{ fontSize: '11px', padding: '4px 8px' }}>
            {weightsOpen ? 'Collapse Sliders' : 'Tune Weights'}
          </button>
        </div>

        {weightsOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Lexical</span>
                <strong>{Math.round(weights.lexical * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.50"
                step="0.05"
                value={weights.lexical}
                onChange={e => setWeights(prev => ({ ...prev, lexical: parseFloat(e.target.value) }))}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Semantic</span>
                <strong>{Math.round(weights.semantic * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.50"
                step="0.05"
                value={weights.semantic}
                onChange={e => setWeights(prev => ({ ...prev, semantic: parseFloat(e.target.value) }))}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Skills</span>
                <strong>{Math.round(weights.skills * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.50"
                step="0.05"
                value={weights.skills}
                onChange={e => setWeights(prev => ({ ...prev, skills: parseFloat(e.target.value) }))}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Experience</span>
                <strong>{Math.round(weights.experience * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.50"
                step="0.05"
                value={weights.experience}
                onChange={e => setWeights(prev => ({ ...prev, experience: parseFloat(e.target.value) }))}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Education</span>
                <strong>{Math.round(weights.education * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.50"
                step="0.05"
                value={weights.education}
                onChange={e => setWeights(prev => ({ ...prev, education: parseFloat(e.target.value) }))}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CGPA</span>
                <strong>{Math.round((weights.cgpa || 0) * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="0.50"
                step="0.05"
                value={weights.cgpa || 0}
                onChange={e => setWeights(prev => ({ ...prev, cgpa: parseFloat(e.target.value) }))}
              />
            </label>
          </div>
        )}
      </div>

      <CandidateTable onSelectCandidate={c => {
        setDrawerCandidate(c)
        onSelectCandidate(c)
      }} />

      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">ACTIVITY TIMELINE</p>
              <h2>Latest system events</h2>
            </div>
            <Badge t="teal">{activitiesList.length} events</Badge>
          </div>
          {activitiesList.slice(-4).reverse().map(a => (
            <div className="activity" key={a.id}>
              <div className="activity-icon green">
                <Check size={15} />
              </div>
              <div>
                <strong>{a.event}</strong>
                <small>
                  {a.subject} · {a.time}
                </small>
              </div>
              <Badge t={a.status === 'Complete' ? 'teal' : a.status === 'Pass' ? 'teal' : 'amber'}>
                {a.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">SIMULATED ADAPTATION</p>
              <h2>Feedback learning queue</h2>
            </div>
            <Badge t="amber">Demo only</Badge>
          </div>
          <div className="adaptation">
            <strong>Current model v1.3.2 → candidate v1.3.3</strong>
            <p>Feedback received → validated → queue updated → ranking re-evaluated.</p>
            <div className="metric-cards">
              <div>
                <small>F1</small>
                <strong>+1.8%</strong>
              </div>
              <div>
                <small>NDCG@10</small>
                <strong>+2.1%</strong>
              </div>
              <div>
                <small>Fairness</small>
                <strong>+0.4%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {uploadModalOpen && <ResumeUploadModal onClose={() => setUploadModalOpen(false)} onNotify={onNotify} />}
      {drawerCandidate && <CandidateDrawer candidate={drawerCandidate} onClose={() => setDrawerCandidate(null)} />}
    </>
  )
}
