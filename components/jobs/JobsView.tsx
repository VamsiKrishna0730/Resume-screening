'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

interface JobsViewProps {
  onNotify: (msg: string, subject?: string) => void
}

export function JobsView({ onNotify }: JobsViewProps) {
  const { jobsList, selectedJobId, setSelectedJobId } = useApp()

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE</p>
          <h1>Job library</h1>
          <p className="lede">Select a synthetic job to inspect requirements and ranking coverage.</p>
        </div>
        <Badge t="amber">Illustrative synthetic data</Badge>
      </div>

      <div className="job-grid">
        {jobsList.map(j => {
          const isSelected = j.id === selectedJobId
          return (
            <button
              className={`panel job-card ${isSelected ? 'selected' : ''}`}
              style={{ border: isSelected ? '2px solid var(--primary)' : undefined, textAlign: 'left', cursor: 'pointer' }}
              key={j.id}
              onClick={() => {
                setSelectedJobId(j.id)
                onNotify('Job selected & candidate rankings re-scored', j.title)
              }}
            >
              <div className="panel-head">
                <div>
                  <p className="eyebrow">{j.id}</p>
                  <h2>{j.title}</h2>
                </div>
                <Badge t={isSelected ? 'teal' : 'neutral'}>{isSelected ? 'Active Job' : `${j.candidates} candidates`}</Badge>
              </div>
              <p>
                {j.department} · {j.education} · {j.experience}
              </p>
              <div className="tags">
                {j.minimumCGPA && (
                  <Badge t={j.cgpaMode === 'HARD' ? 'danger' : 'amber'}>
                    Min CGPA: {j.minimumCGPA}/{j.cgpaScale || 10} ({j.cgpaMode || 'SOFT'})
                  </Badge>
                )}
                {j.required.map(s => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
              <button className="text-button" style={{ marginTop: '12px' }}>
                View requirements <ChevronDown size={14} />
              </button>
            </button>
          )
        })}
      </div>
    </>
  )
}
