'use client'

import React from 'react'
import Link from 'next/link'
import {
  FileText,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  User,
  ExternalLink
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { useAuth } from '@/lib/auth/auth-context'
import { computeProfileCompletion } from '@/lib/context/candidate-utils'
import { scoreCandidate } from '@/lib/matching/score'
import { screenCandidateCGPA } from '@/lib/matching/cgpa'

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

export default function CandidateDashboardPage() {
  const { user } = useAuth()
  const { candidatesList, jobsList, applicationsList, weights } = useApp()

  // Resolve candidate profile corresponding to logged-in user or active session
  const candidate =
    candidatesList.find(c => c.id === user?.candidateId || (user?.email && c.email?.toLowerCase() === user.email.toLowerCase())) ||
    candidatesList.find(c => c.source === 'Candidate Portal') ||
    candidatesList[0]

  const completionRate = computeProfileCompletion(candidate)

  // Candidate applications
  const myApplications = applicationsList.filter(
    a => a.candidateId === candidate.id || (user?.email && a.candidateEmail.toLowerCase() === user.email.toLowerCase())
  )

  const appliedCount = myApplications.filter(a => a.status === 'Applied').length
  const underReviewCount = myApplications.filter(a => a.status === 'Under Review').length
  const shortlistedCount = myApplications.filter(a => a.status === 'Shortlisted').length
  const rejectedCount = myApplications.filter(a => a.status === 'Rejected').length

  // Recommended jobs based on matching candidate skills with active jobs
  const recommendedJobs = jobsList.slice(0, 4).map(job => {
    const match = scoreCandidate(candidate, job, weights)
    const isCgpaActive = job.enableCGPAScreening !== false && job.minimumCGPA !== undefined && job.minimumCGPA > 0
    const cgpaEval = screenCandidateCGPA(candidate.cgpa, candidate.cgpaScale || 10, isCgpaActive ? job.minimumCGPA : undefined, job.cgpaScale || 10, job.cgpaMode || 'HARD')
    const hasApplied = myApplications.some(a => a.jobId === job.id && a.status !== 'Withdrawn')
    return {
      job,
      matchScore: match.totalScore,
      cgpaEval,
      hasApplied
    }
  }).sort((a, b) => b.matchScore - a.matchScore)

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PRISM CANDIDATE PORTAL</p>
          <h1>Welcome, {user?.name || candidate?.name || 'Applicant'}</h1>
          <p className="lede">
            Track your job applications, inspect your automated resume evaluation, and explore career matches.
          </p>
        </div>
        <div className="heading-actions">
          <Link href="/candidate/resume">
            <button className="button primary">
              <Upload size={15} /> Upload Resume
            </button>
          </Link>
          <Link href="/candidate/jobs">
            <button className="button outline">
              <Briefcase size={15} /> Find Jobs
            </button>
          </Link>
        </div>
      </div>

      {/* Top Stats */}
      <div className="stats-grid">
        <StatCard
          label="Resume Status"
          value={candidate?.resumeFile ? 'Uploaded' : 'Not Uploaded'}
          detail={candidate?.resumeFile ? candidate.resumeFile.name : 'Upload PDF or DOCX'}
          icon={FileText}
          t={candidate?.resumeFile ? 'teal' : 'amber'}
        />
        <StatCard
          label="Profile Completion"
          value={`${completionRate}%`}
          detail={completionRate >= 80 ? 'Profile is in strong shape' : 'Add missing details & skills'}
          icon={User}
          t={completionRate >= 80 ? 'teal' : 'amber'}
        />
        <StatCard
          label="Applications Active"
          value={myApplications.length}
          detail={`${appliedCount} Applied · ${underReviewCount} Under Review`}
          icon={Layers}
        />
        <StatCard
          label="Detected CGPA"
          value={candidate?.cgpa !== undefined ? `${candidate.cgpa} / ${candidate.cgpaScale || 10}` : 'Not detected'}
          detail={candidate?.cgpa !== undefined ? 'Structured for screening' : 'Add in profile or resume'}
          icon={Sparkles}
          t={candidate?.cgpa !== undefined ? 'teal' : 'amber'}
        />
      </div>

      {/* Candidate Notice / Advice */}
      <div className="notice" style={{ marginTop: '20px' }}>
        <Sparkles size={18} className="notice-icon" />
        <div>
          <strong>PRISM Explainable AI Matching Active</strong>
          <p>
            PRISM scores match alignment deterministically based on skills coverage, semantic domain depth, and academic eligibility. All estimates are transparent and explainable.
          </p>
        </div>
      </div>

      {/* Main Grid: Recommended Jobs + Recent Applications */}
      <div className="bottom-grid" style={{ marginTop: '0' }}>
        {/* Recommended Jobs */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">RELEVANT OPENINGS</p>
              <h2>Recommended Jobs</h2>
              <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>
                Estimated by PRISM hybrid matching algorithm against your skills
              </small>
            </div>
            <Link href="/candidate/jobs" className="text-button">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recommendedJobs.map(({ job, matchScore, cgpaEval, hasApplied }) => (
              <div
                key={job.id}
                className="activity"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '13px' }}>{job.title}</strong>
                    <Badge t={matchScore >= 80 ? 'teal' : 'amber'}>{matchScore}% Match</Badge>
                    {job.minimumCGPA !== undefined && (
                      <Badge t={cgpaEval.pass ? 'teal' : 'amber'}>
                        Min {job.minimumCGPA}/{job.cgpaScale || 10}
                      </Badge>
                    )}
                  </div>
                  <small style={{ color: 'var(--muted-foreground)' }}>
                    {job.department} · {job.experience} · {job.required.slice(0, 3).join(', ')}
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {hasApplied ? (
                    <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                      <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Applied
                    </span>
                  ) : (
                    <Link href={`/candidate/jobs/${job.id}`}>
                      <button className="button primary" style={{ padding: '5px 10px', fontSize: '11px' }}>
                        View Job
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">CAREER TRACKING</p>
              <h2>My Applications</h2>
              <small style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>
                Real-time status updates from recruiters
              </small>
            </div>
            <Link href="/candidate/applications" className="text-button">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {myApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--muted-foreground)' }}>
              <Layers size={32} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--foreground)' }}>
                No active applications yet
              </strong>
              <p style={{ fontSize: '12px', margin: '4px 0 16px' }}>
                Explore open requisitions and submit your profile with 1-click apply.
              </p>
              <Link href="/candidate/jobs">
                <button className="button outline" style={{ margin: '0 auto', fontSize: '12px' }}>
                  Explore Open Jobs
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myApplications.slice(0, 4).map(app => (
                <div
                  key={app.id}
                  className="activity"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px' }}>{app.jobTitle}</strong>
                    <small style={{ color: 'var(--muted-foreground)' }}>
                      Applied {new Date(app.appliedAt).toLocaleDateString()} · {app.department}
                    </small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge
                      t={
                        app.status === 'Shortlisted'
                          ? 'teal'
                          : app.status === 'Under Review'
                          ? 'amber'
                          : app.status === 'Rejected'
                          ? 'red'
                          : 'blue'
                      }
                    >
                      {app.status}
                    </Badge>
                    <Link href={`/candidate/applications/${app.id}`}>
                      <button className="button outline" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
