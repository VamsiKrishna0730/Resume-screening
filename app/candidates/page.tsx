'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, Sparkles } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { CandidateStatus } from '@/lib/demo-data'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export default function CandidatesPage() {
  const { candidatesList, matchResultsMap, setCandidateStatus } = useApp()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'experience'>('score')

  const filteredCandidates = candidatesList
    .filter(c => {
      const matchesQuery = !query || `${c.name} ${c.skills.join(' ')} ${c.education}`.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
      return matchesQuery && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = matchResultsMap[a.id]?.totalScore || 0
        const scoreB = matchResultsMap[b.id]?.totalScore || 0
        return scoreB - scoreA
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return b.experience - a.experience
    })

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkStatus = (status: CandidateStatus) => {
    selectedIds.forEach(id => setCandidateStatus(id, status))
    setSelectedIds([])
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">TALENT POOL</p>
          <h1>Candidates Management</h1>
          <p className="lede">Search, filter, bulk action, and conduct AI analysis on candidate profiles.</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="heading-actions">
            <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{selectedIds.length} selected</span>
            <button className="button outline" onClick={() => handleBulkStatus('Recommended')}>Bulk Shortlist</button>
            <button className="button outline" onClick={() => handleBulkStatus('Rejected')}>Bulk Reject</button>
          </div>
        )}
      </div>

      <div className="section-head" style={{ marginTop: '20px' }}>
        <div className="table-tools" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div className="search">
            <Search size={15} />
            <input
              placeholder="Search candidate name, skill, degree..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Recommended">Recommended</option>
              <option value="Review">Review</option>
              <option value="Hold">Hold</option>
              <option value="Rejected">Rejected</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
              <option value="score">Sort by Match Score</option>
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel table-panel" style={{ marginTop: '16px' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '32px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                  onChange={e => setSelectedIds(e.target.checked ? filteredCandidates.map(c => c.id) : [])}
                />
              </th>
              <th>Candidate</th>
              <th>Experience</th>
              <th>Education</th>
              <th>Match Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map(c => {
              const res = matchResultsMap[c.id]
              const score = res?.totalScore || 75
              return (
                <tr key={c.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar small">{c.initials}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>{c.name}</strong>
                          {c.source === 'Candidate Portal' && (
                            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 600 }}>
                              Portal
                            </span>
                          )}
                        </div>
                        <small>{c.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>{c.experience} yrs</td>
                  <td>{c.education}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: score >= 85 ? 'var(--primary)' : 'inherit' }}>{score}%</strong>
                      <div style={{ width: '48px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: 'var(--primary)' }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge t={c.status === 'Recommended' || c.status === 'Advanced' ? 'teal' : c.status === 'Rejected' ? 'neutral' : 'amber'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link href={`/candidates/${c.id}`}>
                        <button className="button outline" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          <Sparkles size={12} /> Analyze
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
