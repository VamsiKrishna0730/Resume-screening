'use client'

import React from 'react'
import { Candidate } from '@/lib/matching/types'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

const tone = (s: string) =>
  s === 'Recommended' || s === 'Advanced' || s === 'Pass' || s === 'Clear'
    ? 'teal'
    : s === 'Review' || s === 'Monitor' || s === 'Hold'
    ? 'amber'
    : s === 'Rejected' || s === 'REVIEW'
    ? 'red'
    : 'neutral'

interface CandidatesViewProps {
  onSelectCandidate: (c: Candidate) => void
}

export function CandidatesView({ onSelectCandidate }: CandidatesViewProps) {
  const { candidatesList, matchResultsMap } = useApp()

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CANDIDATE MANAGEMENT</p>
          <h1>Candidate workspace</h1>
          <p className="lede">Search, inspect, and annotate the full synthetic candidate pool.</p>
        </div>
      </div>

      <div className="candidate-cards">
        {candidatesList.map(c => {
          const match = matchResultsMap[c.id] || { totalScore: 75 }
          return (
            <button className="candidate-card" key={c.id} onClick={() => onSelectCandidate(c)}>
              <div className="candidate-name">
                <div className="avatar">{c.initials}</div>
                <div>
                  <strong>{c.name}</strong>
                  <small>
                    {c.id} · {c.education}
                  </small>
                </div>
              </div>
              <p>{c.summary}</p>
              <div className="tags">
                {c.skills.map(s => (
                  <Badge key={s} t="teal">
                    {s}
                  </Badge>
                ))}
              </div>
              <footer>
                <span>{c.experience} yrs</span>
                <Badge t={tone(c.fairness)}>{c.fairness}</Badge>
                <strong>{match.totalScore}</strong>
              </footer>
            </button>
          )
        })}
      </div>
    </>
  )
}
