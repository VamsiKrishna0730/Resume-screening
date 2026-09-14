'use client'

import React from 'react'
import { Users, Gauge, Activity, ShieldCheck } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

function Stat({ label, value, detail, icon: Icon, t = 'teal' }: any) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <strong>{value}</strong>
      <small className={t === 'amber' ? 'amber' : ''}>{detail}</small>
    </div>
  )
}

export function ScreeningKPIs() {
  const { candidatesList, matchResultsMap, fairnessReport, selectedJob } = useApp()

  const qualifiedCount = candidatesList.filter(c => (matchResultsMap[c.id]?.totalScore || 0) >= 80).length
  const avgScore =
    candidatesList.length > 0
      ? Math.round(
          candidatesList.reduce((acc, c) => acc + (matchResultsMap[c.id]?.totalScore || 0), 0) / candidatesList.length
        )
      : 83

  const isCgpaScreeningActive = selectedJob.enableCGPAScreening !== false && selectedJob.minimumCGPA !== undefined

  const cgpaPassed = candidatesList.filter(c => matchResultsMap[c.id]?.cgpaAssessment?.screeningStatus === 'PASS').length
  const cgpaFailed = candidatesList.filter(c => matchResultsMap[c.id]?.cgpaAssessment?.screeningStatus === 'FAIL').length
  const cgpaNotFound = candidatesList.filter(c => {
    const s = matchResultsMap[c.id]?.cgpaAssessment?.screeningStatus
    return s === 'CGPA NOT FOUND' || s === 'INVALID CGPA'
  }).length

  return (
    <div className="stats-grid">
      <Stat label="Candidates screened" value={candidatesList.length} detail="+18 from last run" icon={Users} />
      {isCgpaScreeningActive ? (
        <Stat
          label="CGPA Eligibility"
          value={`${cgpaPassed} Pass / ${cgpaFailed} Fail`}
          detail={`Requirement: ≥ ${selectedJob.minimumCGPA} / ${selectedJob.cgpaScale || 10} (${cgpaNotFound} not found)`}
          icon={Gauge}
          t={cgpaFailed === 0 ? 'teal' : 'amber'}
        />
      ) : (
        <Stat label="Qualified for review" value={qualifiedCount} detail="Score threshold ≥ 80" icon={Gauge} />
      )}
      <Stat label="Average match score" value={`${avgScore}%`} detail="Derived from components" icon={Activity} />
      <Stat
        label="Fairness status"
        value={fairnessReport.overallStatus}
        detail={`${fairnessReport.metrics.filter(m => m.status === 'Pass').length} pass, 1 monitor`}
        icon={ShieldCheck}
        t={fairnessReport.overallStatus === 'PASS' ? 'teal' : 'amber'}
      />
    </div>
  )
}
