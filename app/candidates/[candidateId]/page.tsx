'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Check, HelpCircle, FileText, Search, Shield, ChevronRight } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { CandidateStatus } from '@/lib/demo-data'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export default function CandidateDetailPage({ params }: { params: Promise<{ candidateId: string }> }) {
  const resolvedParams = use(params)
  const candidateId = resolvedParams.candidateId

  const { candidatesList, matchResultsMap, setCandidateStatus, selectedJob, addActivityEvent } = useApp()
  const candidate = candidatesList.find(c => c.id === candidateId) || candidatesList[0]
  const matchResult = matchResultsMap[candidate.id]

  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'explanation' | 'skills' | 'interview' | 'summary'>('analysis')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [explanationData, setExplanationData] = useState<any>(null)
  const [skillsData, setSkillsData] = useState<any>(null)
  const [interviewData, setInterviewData] = useState<any>(null)
  const [summaryData, setSummaryData] = useState<any>(null)
  const [toastMsg, setToastMsg] = useState('')

  const notify = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const handleDecision = (status: CandidateStatus) => {
    setCandidateStatus(candidate.id, status)
    addActivityEvent(`Recruiter decision: ${status}`, `${candidate.name} (${candidate.id})`, 'Complete')
    notify(`Candidate marked as ${status}`)
  }

  // 1. Analyze Candidate
  const runAnalyze = async () => {
    setAiLoading(true)
    setActiveTab('analysis')
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateText: `Candidate: ${candidate.name}, Skills: ${candidate.skills.join(', ')}, Degree: ${candidate.education}`,
          jobTitle: selectedJob.title,
        }),
      })
      const json = await res.json()
      if (json.success) setAnalysisData(json.data)
      notify('AI Analysis generated')
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  // 2. Explain Match
  const runExplain = async () => {
    setAiLoading(true)
    setActiveTab('explanation')
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id, jobId: selectedJob.id }),
      })
      const json = await res.json()
      if (json.success) setExplanationData(json.data)
      notify('Match Explanation generated')
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  // 3. Find Missing Skills
  const runSkills = async () => {
    setAiLoading(true)
    setActiveTab('skills')
    try {
      const res = await fetch('/api/ai/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id, jobId: selectedJob.id }),
      })
      const json = await res.json()
      if (json.success) setSkillsData(json.data)
      notify('Skill gap analysis generated')
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  // 4. Generate Interview Questions
  const runInterview = async () => {
    setAiLoading(true)
    setActiveTab('interview')
    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id, jobId: selectedJob.id }),
      })
      const json = await res.json()
      if (json.success) setInterviewData(json.data)
      notify('Interview questions generated')
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  // 5. Generate Recruiter Summary
  const runSummary = async () => {
    setAiLoading(true)
    setActiveTab('summary')
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateText: `Candidate: ${candidate.name}, Skills: ${candidate.skills.join(', ')}, Degree: ${candidate.education}`,
          jobTitle: selectedJob.title,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSummaryData({
          recruiterSummary: `Executive briefing for ${candidate.name}: Profile matches ${matchResult?.totalScore || 85}% of specifications for ${selectedJob.title}. Candidate demonstrates solid foundations in ${candidate.skills.slice(0, 3).join(', ')}.`,
          recommendedAction: json.data?.recommendedAction || 'Advance for Technical Interview',
          provider: json.data?.provider || 'Deterministic Fallback',
        })
      }
      notify('Recruiter summary generated')
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  const parts = matchResult?.scoreParts || {
    lexical: 80,
    semantic: 85,
    skills: 90,
    experience: 85,
    education: 80,
    projects: 85,
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <Link href="/candidates" className="text-button" style={{ marginBottom: '8px', display: 'inline-flex' }}>
            <ArrowLeft size={14} /> Back to Candidates
          </Link>
          <p className="eyebrow">{candidate.id} · CANDIDATE PROFILE</p>
          <h1>{candidate.name}</h1>
          <p className="lede">
            {candidate.education} · {candidate.experience} Years Experience
            {candidate.cgpa !== undefined && ` · CGPA: ${candidate.cgpa} / ${candidate.cgpaScale || 10}`} · Status: {candidate.status}
            {candidate.source === 'Candidate Portal' && (
              <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 600 }}>
                Candidate Portal Applicant
              </span>
            )}
          </p>
        </div>
        <div className="heading-actions">
          <button className="button outline" onClick={() => handleDecision('Hold')}>Hold</button>
          <button className="button outline" onClick={() => handleDecision('Rejected')}>Reject</button>
          <button className="button primary" onClick={() => handleDecision('Recommended')}>Shortlist Candidate</button>
        </div>
      </div>

      {toastMsg && (
        <div className="toast" role="status" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
          <Check size={15} /> {toastMsg}
        </div>
      )}

      <div className="bottom-grid" style={{ marginTop: '20px' }}>
        {/* Left Panel: Profile and Features */}
        <div className="panel">
          <div className="panel-head">
            <h2>Evaluation vs {selectedJob.title}</h2>
            <Badge t="teal">{matchResult?.totalScore || 85}% Hybrid Score</Badge>
          </div>

          {matchResult?.cgpaAssessment && (
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'var(--muted)', border: '1px solid var(--border)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>CGPA RESUME SCREENING</span>
                <Badge t={matchResult.cgpaAssessment.screeningStatus === 'PASS' ? 'teal' : matchResult.cgpaAssessment.screeningStatus === 'FAIL' ? 'red' : 'amber'}>
                  {matchResult.cgpaAssessment.screeningStatus}
                </Badge>
              </div>
              <p style={{ fontSize: '12px', margin: '4px 0 2px', fontWeight: 600 }}>
                {matchResult.cgpaAssessment.screeningStatus === 'PASS' && '✓ Candidate meets or exceeds minimum CGPA requirement.'}
                {matchResult.cgpaAssessment.screeningStatus === 'FAIL' && '✕ NOT ELIGIBLE — CGPA Requirement Not Met.'}
                {matchResult.cgpaAssessment.screeningStatus === 'CGPA NOT FOUND' && '⚠ CGPA Not Found on Candidate Resume.'}
                {matchResult.cgpaAssessment.screeningStatus === 'INVALID CGPA' && '✕ Invalid CGPA value supplied.'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', margin: 0 }}>
                {matchResult.cgpaAssessment.screeningReason}
              </p>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <small className="eyebrow">FEATURE SCORE BREAKDOWN</small>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {Object.entries(parts).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ textTransform: 'capitalize' }}>{k}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '120px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${v}%`, height: '100%', background: 'var(--primary)' }} />
                    </div>
                    <strong>{v}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <small className="eyebrow">SKILLS PORTFOLIO</small>
            <div className="tags" style={{ marginTop: '8px' }}>
              {candidate.skills.map(s => (
                <Badge key={s} t={selectedJob.required.includes(s) ? 'teal' : 'neutral'}>
                  {selectedJob.required.includes(s) ? '✓ ' : ''}{s}
                </Badge>
              ))}
              {candidate.cgpa !== undefined && (
                <Badge t="amber">
                  CGPA: {candidate.cgpa} / {candidate.cgpaScale || 10}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: AI Workspace with Tabs */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">AI REASONING WORKSPACE</p>
              <h2>AI Intelligence Actions</h2>
            </div>
            <Badge t="teal">{analysisData?.provider || 'AI Reasoning Workspace'}</Badge>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '14px 0' }}>
            <button className={`button ${activeTab === 'analysis' ? 'primary' : 'outline'}`} onClick={runAnalyze} disabled={aiLoading} style={{ fontSize: '11px', padding: '6px 10px' }}>
              <Sparkles size={13} /> Analyze Profile
            </button>
            <button className={`button ${activeTab === 'explanation' ? 'primary' : 'outline'}`} onClick={runExplain} disabled={aiLoading} style={{ fontSize: '11px', padding: '6px 10px' }}>
              <FileText size={13} /> Explain Match
            </button>
            <button className={`button ${activeTab === 'skills' ? 'primary' : 'outline'}`} onClick={runSkills} disabled={aiLoading} style={{ fontSize: '11px', padding: '6px 10px' }}>
              <Search size={13} /> Missing Skills
            </button>
            <button className={`button ${activeTab === 'interview' ? 'primary' : 'outline'}`} onClick={runInterview} disabled={aiLoading} style={{ fontSize: '11px', padding: '6px 10px' }}>
              <HelpCircle size={13} /> Interview Qs
            </button>
            <button className={`button ${activeTab === 'summary' ? 'primary' : 'outline'}`} onClick={runSummary} disabled={aiLoading} style={{ fontSize: '11px', padding: '6px 10px' }}>
              <Shield size={13} /> Recruiter Summary
            </button>
          </div>

          {aiLoading ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted-foreground)' }}>
              <Sparkles size={24} style={{ margin: '0 auto 8px auto', animation: 'spin 1.5s linear infinite' }} />
              <p style={{ fontSize: '12px' }}>Processing server-side AI evaluation...</p>
            </div>
          ) : (
            <>
              {activeTab === 'analysis' && analysisData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <p><strong>Provider:</strong> {analysisData.provider}</p>
                  <div>
                    <strong>Strengths:</strong>
                    <ul style={{ paddingLeft: '16px', margin: '4px 0' }}>
                      {analysisData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong>Missing Skills:</strong> {analysisData.missingSkills.join(', ')}
                  </div>
                  <p><strong>Recommended Action:</strong> {analysisData.recommendedAction}</p>
                </div>
              )}

              {activeTab === 'explanation' && explanationData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <p><strong>Summary:</strong> {explanationData.summary}</p>
                  <div>
                    <strong>Key Positive Contributions:</strong>
                    <ul style={{ paddingLeft: '16px', margin: '4px 0' }}>
                      {explanationData.positiveContributions.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  {explanationData.negativeContributions.length > 0 && (
                    <div>
                      <strong>Gaps / Trade-offs:</strong>
                      <ul style={{ paddingLeft: '16px', margin: '4px 0' }}>
                        {explanationData.negativeContributions.map((c: string, i: number) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skills' && skillsData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <p><strong>Skill Coverage Ratio:</strong> {(skillsData.coverageRatio * 100).toFixed(0)}%</p>
                  <div>
                    <strong>Matched Requirements:</strong>
                    <div className="tags" style={{ marginTop: '4px' }}>
                      {skillsData.matchedSkills.map((s: string) => <Badge key={s} t="teal">{s}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <strong>Missing Requirements:</strong>
                    <div className="tags" style={{ marginTop: '4px' }}>
                      {skillsData.missingSkills.length > 0 ? (
                        skillsData.missingSkills.map((s: string) => <Badge key={s} t="amber">{s}</Badge>)
                      ) : (
                        <span>None (All required skills satisfied)</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'interview' && interviewData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <strong>Tailored Interview Questions:</strong>
                  <ol style={{ paddingLeft: '18px', margin: '4px 0', lineHeight: '1.6' }}>
                    {interviewData.questions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                  </ol>
                </div>
              )}

              {activeTab === 'summary' && summaryData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <p><strong>Provider:</strong> {summaryData.provider}</p>
                  <div>
                    <strong>Executive Candidate Briefing:</strong>
                    <p style={{ marginTop: '4px', lineHeight: '1.6' }}>{summaryData.recruiterSummary}</p>
                  </div>
                  <div>
                    <strong>Hiring Stage Recommendation:</strong>
                    <p style={{ marginTop: '4px', fontWeight: 600, color: 'var(--primary)' }}>{summaryData.recommendedAction}</p>
                  </div>
                </div>
              )}

              {!analysisData && !explanationData && !skillsData && !interviewData && !summaryData && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)' }}>
                  <Sparkles size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '12px' }}>Select an action above to generate candidate AI analysis, explanations, or interview questions.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
