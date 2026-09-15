'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, CircleHelp, AlertTriangle, Plus, Sparkles } from 'lucide-react'
import { Candidate, CandidateStatus } from '@/lib/matching/types'
import { useApp } from '@/lib/context/AppContext'

interface CandidateDrawerProps {
  candidate: Candidate
  onClose: () => void
}

const tone = (s: string) =>
  s === 'Recommended' || s === 'Advanced' || s === 'Pass' || s === 'Clear'
    ? 'teal'
    : s === 'Review' || s === 'Monitor' || s === 'Hold'
    ? 'amber'
    : s === 'Rejected' || s === 'REVIEW'
    ? 'red'
    : 'neutral'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

function Ring({ value }: { value: number }) {
  return (
    <div className="score-ring" style={{ '--score': `${value * 3.6}deg` } as React.CSSProperties}>
      <span>{Math.round(value)}</span>
    </div>
  )
}

export function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  const { matchResultsMap, setCandidateStatus, setCandidateFeedback, addCandidateNote, feedbackMap, statuses, notesMap } = useApp()
  const [noteText, setNoteText] = useState('')

  const match = matchResultsMap[candidate.id] || {
    totalScore: 75,
    scoreParts: { lexical: 75, semantic: 75, skills: 75, experience: 75, education: 75, projects: 75, cgpa: 75 },
    skillAnalysis: { matchedSkills: [], missingSkills: [], preferredMatched: [], score: 75, coverageRatio: 0.75 },
    explanations: [],
    confidence: 'Medium' as const,
    isEligible: true,
  }

  const currentFeedback = feedbackMap[candidate.id] || ''
  const currentStatus = statuses[candidate.id] || candidate.status
  const currentNote = notesMap[candidate.id] || ''

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Candidate Details">
      <aside className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <p className="eyebrow">CANDIDATE REVIEW · HUMAN-IN-THE-LOOP</p>
            <h2>{candidate.name}</h2>
            <p>
              {candidate.id} · {candidate.education} · {candidate.cgpa !== undefined ? `CGPA ${candidate.cgpa}/${candidate.cgpaScale || 10}` : 'CGPA: Not Provided'} · {candidate.location}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close candidate review">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-score">
          <Ring value={match.totalScore} />
          <div>
            <span className="eyebrow">HYBRID SCORE</span>
            <strong>{match.totalScore} / 100</strong>
            <p>Confidence indicator: {match.confidence}</p>
            {match.cgpaAssessment && (
              <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '6px', background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CGPA Screening:</strong>
                  <Badge t={match.cgpaAssessment.screeningStatus === 'PASS' ? 'teal' : match.cgpaAssessment.screeningStatus === 'FAIL' ? 'red' : 'amber'}>
                    {match.cgpaAssessment.screeningStatus}
                  </Badge>
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>
                  {match.cgpaAssessment.screeningStatus === 'PASS' && (
                    <span style={{ color: 'var(--teal)' }}>✓ Meets minimum CGPA requirement.</span>
                  )}
                  {match.cgpaAssessment.screeningStatus === 'FAIL' && (
                    <span style={{ color: 'var(--red)' }}>✕ NOT ELIGIBLE — CGPA REQUIREMENT NOT MET.</span>
                  )}
                  {match.cgpaAssessment.screeningStatus === 'CGPA NOT FOUND' && (
                    <span style={{ color: 'var(--amber)' }}>⚠ CGPA Not Found in resume.</span>
                  )}
                  {match.cgpaAssessment.screeningStatus === 'INVALID CGPA' && (
                    <span style={{ color: 'var(--red)' }}>✕ Invalid CGPA value provided.</span>
                  )}
                  <p style={{ margin: '2px 0 0', color: 'var(--muted-foreground)', fontSize: '10px' }}>
                    {match.cgpaAssessment.screeningReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="drawer-section">
          <h3>Resume signal</h3>
          <p>{candidate.summary}</p>
          <div className="tags">
            {candidate.skills.map(s => (
              <Badge key={s} t="teal">
                {s}
              </Badge>
            ))}
            {candidate.cgpa !== undefined && (
              <Badge t="amber">
                CGPA: {candidate.cgpa} / {candidate.cgpaScale || 10}
              </Badge>
            )}
          </div>
        </div>

        <div className="drawer-section">
          <h3>
            Score breakdown <CircleHelp size={14} />
          </h3>
          {Object.entries(match.scoreParts).map(([k, v]) => (
            <div className="factor" key={k}>
              <div>
                <span>{k === 'cgpa' ? 'CGPA' : k[0].toUpperCase() + k.slice(1)}</span>
                <b>{v}%</b>
              </div>
              <div className="factor-track">
                <span style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
          <p className="microcopy">
            Active scoring configuration · lexical 18% · semantic 27% · skills 23% · experience 14% · education 8% · CGPA 10%
          </p>
        </div>

        <div className="drawer-section">
          <h3>Feature-grounded research explanation</h3>
          {match.explanations.map((exp, idx) => (
            <div className="contribution" key={idx}>
              <span>{exp.feature}</span>
              <b className={exp.isPositive ? '' : 'negative'}>
                {exp.isPositive ? `+${exp.contribution}` : exp.contribution}
              </b>
            </div>
          ))}

          <div className="caveat">
            <AlertTriangle size={16} />
            <div>
              <strong>Fairness audit · {candidate.fairness}</strong>
              <p>
                Protected attributes are not used as ranking features. Synthetic group audit data still requires recruiter review.
              </p>
            </div>
          </div>
        </div>

        <div className="drawer-section">
          <h3>Recruiter feedback</h3>
          <div className="feedback-grid">
            {['Relevant', 'Partially Relevant', 'Not Relevant'].map(f => (
              <button
                key={f}
                className={`button ${currentFeedback === f ? 'primary' : ''}`}
                onClick={() => setCandidateFeedback(candidate.id, f)}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="microcopy">Feedback is stored in state and queued for adaptive-learning updates.</p>
        </div>

        <div className="drawer-section">
          <Link
            href={`/candidates/${candidate.id}`}
            onClick={onClose}
            className="button primary"
            style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} /> Open Full Profile & AI Analysis
          </Link>
        </div>

        <div className="drawer-section">
          <h3>Recruiter action</h3>
          <div className="action-row" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              className={`button ${currentStatus === 'Advanced' ? 'primary' : ''}`}
              onClick={() => setCandidateStatus(candidate.id, 'Advanced')}
            >
              Advance
            </button>
            <button
              className={`button ${currentStatus === 'Hold' ? 'primary' : ''}`}
              onClick={() => setCandidateStatus(candidate.id, 'Hold')}
            >
              Hold
            </button>
            <button
              className={`button ${currentStatus === 'Rejected' ? 'primary' : ''}`}
              onClick={() => setCandidateStatus(candidate.id, 'Rejected')}
            >
              Reject
            </button>
          </div>

          <textarea
            aria-label="Candidate note"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder={currentNote ? `Current note: ${currentNote}` : 'Add a review note...'}
          />
          <button
            className="button outline"
            style={{ marginTop: '8px' }}
            onClick={() => {
              if (noteText.trim()) {
                addCandidateNote(candidate.id, noteText.trim())
                setNoteText('')
              }
            }}
          >
            <Plus size={15} /> Add Note
          </button>
        </div>
      </aside>
    </div>
  )
}
