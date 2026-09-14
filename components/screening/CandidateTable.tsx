'use client'

import React, { useState, useMemo } from 'react'
import { Search, MoreHorizontal } from 'lucide-react'
import { Candidate, CandidateStatus } from '@/lib/matching/types'
import { useApp } from '@/lib/context/AppContext'

interface CandidateTableProps {
  onSelectCandidate?: (c: Candidate) => void
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

export function CandidateTable({ onSelectCandidate }: CandidateTableProps) {
  const { candidatesList, matchResultsMap, statuses, selectedJob } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('score')

  const isCgpaScreeningActive = selectedJob.enableCGPAScreening !== false && selectedJob.minimumCGPA !== undefined

  const rows = useMemo(() => {
    return candidatesList
      .filter(c => {
        const scoreVal = matchResultsMap[c.id]?.totalScore || 75
        const statusVal = statuses[c.id] || c.status
        const cgpaAssessment = matchResultsMap[c.id]?.cgpaAssessment
        const screeningStatus = cgpaAssessment?.screeningStatus

        const matchesQuery =
          !query ||
          `${c.name} ${c.skills.join(' ')} ${c.education} ${statusVal} ${c.cgpa || ''} ${screeningStatus || ''}`.toLowerCase().includes(query.toLowerCase())

        if (!matchesQuery) return false

        if (filter === 'All') return true
        if (filter === 'CGPA Passed') return screeningStatus === 'PASS'
        if (filter === 'CGPA Failed') return screeningStatus === 'FAIL'
        if (filter === 'CGPA Not Found') return screeningStatus === 'CGPA NOT FOUND' || screeningStatus === 'INVALID CGPA'
        if (filter === 'Score > 90') return scoreVal > 90
        if (filter === 'Score > 80') return scoreVal > 80
        if (filter === 'High confidence') return scoreVal >= 88
        if (filter === 'Fairness review') return c.fairness === 'Review'
        return statusVal === filter
      })
      .sort((a, b) => {
        const scoreA = matchResultsMap[a.id]?.totalScore || 0
        const scoreB = matchResultsMap[b.id]?.totalScore || 0
        return sort === 'score' ? scoreB - scoreA : a.name.localeCompare(b.name)
      })
  }, [candidatesList, matchResultsMap, statuses, query, filter, sort])

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Ranked candidates</h2>
          <p>Dynamic hybrid score = weighted lexical, semantic, skills, experience, education, and project signals.</p>
        </div>
        <div className="table-tools">
          <div className="search">
            <Search size={15} />
            <input
              aria-label="Search candidates"
              placeholder="Search candidates, skills, education"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select aria-label="Filter candidates" value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option>
            {isCgpaScreeningActive && (
              <>
                <option>CGPA Passed</option>
                <option>CGPA Failed</option>
                <option>CGPA Not Found</option>
              </>
            )}
            <option>Recommended</option>
            <option>Advanced</option>
            <option>Review</option>
            <option>Hold</option>
            <option>Rejected</option>
            <option>{'Score > 80'}</option>
            <option>{'Score > 90'}</option>
            <option>High confidence</option>
            <option>Fairness review</option>
          </select>
          <select aria-label="Sort candidates" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="score">Sort: score</option>
            <option value="name">Sort: name</option>
          </select>
        </div>
      </div>

      <div className="candidate-table">
        <div className="table-header" style={{ gridTemplateColumns: isCgpaScreeningActive ? '2.0fr 1.1fr 1.0fr .8fr .8fr 1.1fr 25px' : undefined }}>
          <span>Candidate</span>
          <span>Hybrid score</span>
          {isCgpaScreeningActive && <span>CGPA Status</span>}
          <span>Confidence</span>
          <span>Fairness</span>
          <span>Status</span>
          <span></span>
        </div>

        {rows.length ? (
          rows.map(c => {
            const match = matchResultsMap[c.id] || { totalScore: 75, confidence: 'Medium' as const }
            const currentStatus = statuses[c.id] || c.status
            const cgpaAssessment = match.cgpaAssessment
            const screeningStatus = cgpaAssessment?.screeningStatus

            return (
              <button
                className="candidate-row"
                style={{ gridTemplateColumns: isCgpaScreeningActive ? '2.0fr 1.1fr 1.0fr .8fr .8fr 1.1fr 25px' : undefined }}
                key={c.id}
                onClick={() => onSelectCandidate?.(c)}
              >
                <div className="candidate-name">
                  <div className="avatar">{c.initials}</div>
                  <div>
                    <strong>{c.name}</strong>
                    <small>
                      {c.id} · {c.experience} yrs · {c.cgpa !== undefined ? `CGPA ${c.cgpa}/${c.cgpaScale || 10}` : 'CGPA: Not Found'} · {c.skills.slice(0, 2).join(' · ')}
                    </small>
                  </div>
                </div>

                <div className="score-cell">
                  <Ring value={match.totalScore} />
                  <div>
                    <strong>{match.totalScore}/100</strong>
                    <small>Calculated score</small>
                  </div>
                </div>

                {isCgpaScreeningActive && (
                  <div>
                    {screeningStatus === 'PASS' && (
                      <Badge t="teal">
                        ✓ PASS ({c.cgpa}/{c.cgpaScale || 10})
                      </Badge>
                    )}
                    {screeningStatus === 'FAIL' && (
                      <Badge t="red">
                        ✕ FAIL ({c.cgpa}/{c.cgpaScale || 10})
                      </Badge>
                    )}
                    {(screeningStatus === 'CGPA NOT FOUND' || !screeningStatus) && (
                      <Badge t="amber">NOT FOUND</Badge>
                    )}
                    {screeningStatus === 'INVALID CGPA' && (
                      <Badge t="red">INVALID</Badge>
                    )}
                  </div>
                )}

                <div>
                  <Badge t={match.totalScore >= 88 ? 'teal' : match.totalScore >= 75 ? 'amber' : 'neutral'}>
                    {match.confidence}
                  </Badge>
                </div>

                <div>
                  <Badge t={tone(c.fairness)}>{c.fairness}</Badge>
                </div>

                <div>
                  <Badge t={tone(currentStatus)}>{currentStatus}</Badge>
                </div>

                <MoreHorizontal size={18} />
              </button>
            )
          })
        ) : (
          <div className="empty" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            No candidates match this research filter.
          </div>
        )}
      </div>
    </div>
  )
}
