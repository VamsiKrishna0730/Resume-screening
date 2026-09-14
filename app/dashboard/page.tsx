'use client'

import React from 'react'
import Link from 'next/link'
import { Users, BriefcaseBusiness, Gauge, ShieldCheck, Activity, Plus, Upload, ArrowRight, Check } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

function StatCard({ label, value, detail, icon: Icon, t = 'teal' }: any) {
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

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export default function DashboardPage() {
  const { jobsList, candidatesList, matchResultsMap, fairnessReport, activitiesList } = useApp()

  const qualifiedCount = candidatesList.filter(c => (matchResultsMap[c.id]?.totalScore || 0) >= 80).length
  const avgScore =
    candidatesList.length > 0
      ? Math.round(
          candidatesList.reduce((acc, c) => acc + (matchResultsMap[c.id]?.totalScore || 0), 0) / candidatesList.length
        )
      : 83

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RECRUITMENT INTELLIGENCE PLATFORM</p>
          <h1>Executive Dashboard</h1>
          <p className="lede">Overview of hiring pipeline, candidate matching accuracy, and fairness monitoring.</p>
        </div>
        <div className="heading-actions">
          <Link href="/jobs">
            <button className="button outline">
              <Plus size={16} /> Create Job
            </button>
          </Link>
          <Link href="/screening">
            <button className="button primary">
              <Gauge size={16} /> Start Screening
            </button>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Active Jobs" value={jobsList.length} detail="5 active requisitions" icon={BriefcaseBusiness} />
        <StatCard label="Total Candidates" value={candidatesList.length} detail="+18 this week" icon={Users} />
        <StatCard label="Qualified for Review" value={qualifiedCount} detail="Score threshold ≥ 80" icon={Gauge} />
        <StatCard label="Average Match Score" value={`${avgScore}%`} detail="Derived from 6 features" icon={Activity} />
      </div>

      <div className="bottom-grid" style={{ marginTop: '20px' }}>
        {/* Recent Jobs Panel */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">ACTIVE REQUISITIONS</p>
              <h2>Recent Jobs</h2>
            </div>
            <Link href="/jobs" className="text-button">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {jobsList.slice(0, 3).map(j => (
            <div className="activity" key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{j.title}</strong>
                <small>{j.id} · {j.department} · {j.experience}</small>
              </div>
              <Link href={`/screening/${j.id}`}>
                <button className="button outline" style={{ padding: '4px 8px', fontSize: '11px' }}>
                  Screen pool
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Recent Candidates Panel */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">TOP RANKED CANDIDATES</p>
              <h2>Matching Candidates</h2>
            </div>
            <Link href="/candidates" className="text-button">
              View pool <ArrowRight size={14} />
            </Link>
          </div>
          {candidatesList.slice(0, 3).map(c => {
            const scoreVal = matchResultsMap[c.id]?.totalScore || 80
            return (
              <div className="activity" key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="avatar small">{c.initials}</div>
                  <div>
                    <strong>{c.name}</strong>
                    <small>{c.id} · {c.education}</small>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge t={scoreVal >= 88 ? 'teal' : 'amber'}>{scoreVal}% match</Badge>
                  <Link href={`/candidates/${c.id}`}>
                    <button className="button outline" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      Analyze
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">SYSTEM LOGS</p>
            <h2>Recent Activity Timeline</h2>
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
              <small>{a.subject} · {a.time}</small>
            </div>
            <Badge t={a.status === 'Complete' ? 'teal' : 'amber'}>{a.status}</Badge>
          </div>
        ))}
      </div>
    </>
  )
}
