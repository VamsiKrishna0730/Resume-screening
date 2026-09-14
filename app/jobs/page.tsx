'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, ChevronDown, BriefcaseBusiness, Trash2, Copy, FileText, X } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export default function JobsPage() {
  const router = useRouter()
  const { jobsList, selectedJobId, setSelectedJobId, addJob } = useApp()
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newDept, setNewDept] = useState('Engineering')
  const [newSkills, setNewSkills] = useState('Python, Machine Learning, SQL, NLP')
  const [newExp, setNewExp] = useState('2 years')
  const [newEdu, setNewEdu] = useState('B.Tech / B.E / M.Tech')
  const [newLoc, setNewLoc] = useState('Hyderabad')
  const [newEnableCGPA, setNewEnableCGPA] = useState(true)
  const [newMinCGPA, setNewMinCGPA] = useState('7.0')
  const [newCgpaScale, setNewCgpaScale] = useState('10')
  const [newCgpaMode, setNewCgpaMode] = useState<'HARD' | 'SOFT'>('HARD')

  const filteredJobs = jobsList.filter(j => {
    const matchesQuery = !query || `${j.title} ${j.department} ${j.required.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    const matchesDept = deptFilter === 'All' || j.department === deptFilter
    return matchesQuery && matchesDept
  })

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">REQUISITION MANAGEMENT</p>
          <h1>Job Library</h1>
          <p className="lede">Manage active job requisitions, requirements, and candidate matching pipelines.</p>
        </div>
        <div className="heading-actions">
          <button className="button primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> Create Job
          </button>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: '20px' }}>
        <div className="table-tools" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div className="search">
            <Search size={15} />
            <input
              placeholder="Search jobs by title or skill..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="Applied AI">Applied AI</option>
            <option value="Research">Research</option>
            <option value="Product Engineering">Product Engineering</option>
            <option value="Platform">Platform</option>
          </select>
        </div>
      </div>

      <div className="job-grid" style={{ marginTop: '16px' }}>
        {filteredJobs.map(j => {
          const isSelected = j.id === selectedJobId
          return (
            <div
              className={`panel job-card ${isSelected ? 'selected' : ''}`}
              style={{ border: isSelected ? '2px solid var(--primary)' : undefined }}
              key={j.id}
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
                {j.required.map(s => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Link href={`/jobs/${j.id}`}>
                  <button className="button outline" style={{ fontSize: '11px' }}>
                    View details
                  </button>
                </Link>
                <Link href={`/screening/${j.id}`}>
                  <button
                    className="button primary"
                    style={{ fontSize: '11px' }}
                    onClick={() => setSelectedJobId(j.id)}
                  >
                    Screen pool
                  </button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Job Form Modal */}
      {createModalOpen && (
        <div className="drawer-backdrop" onClick={() => setCreateModalOpen(false)} role="dialog" aria-modal="true">
          <div
            className="panel"
            onClick={e => e.stopPropagation()}
            style={{ width: 'min(520px, 92%)', margin: 'auto', background: 'var(--card)', borderRadius: '8px', padding: '24px' }}
          >
            <div className="panel-head">
              <div>
                <p className="eyebrow">REQUISITION FORM</p>
                <h2>Create New Job Requisition</h2>
              </div>
              <button className="icon-button" onClick={() => setCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <div>
                <small className="eyebrow">JOB TITLE</small>
                <input
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                  placeholder="e.g. Senior MLOps Engineer"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <small className="eyebrow">DEPARTMENT</small>
                <select
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                >
                  <option value="Applied AI">Applied AI</option>
                  <option value="Research">Research</option>
                  <option value="Product Engineering">Product Engineering</option>
                  <option value="Platform">Platform</option>
                </select>
              </div>

              <div>
                <small className="eyebrow">LOCATION</small>
                <input
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                  placeholder="e.g. Hyderabad"
                  value={newLoc}
                  onChange={e => setNewLoc(e.target.value)}
                />
              </div>

              <div>
                <small className="eyebrow">EXPERIENCE REQUIREMENT</small>
                <input
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                  placeholder="e.g. 2 years"
                  value={newExp}
                  onChange={e => setNewExp(e.target.value)}
                />
              </div>

              <div>
                <small className="eyebrow">EDUCATION REQUIREMENT</small>
                <input
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                  placeholder="e.g. B.Tech / B.E / M.Tech"
                  value={newEdu}
                  onChange={e => setNewEdu(e.target.value)}
                />
              </div>

              <div>
                <small className="eyebrow">REQUIRED SKILLS (COMMA SEPARATED)</small>
                <input
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                  placeholder="Python, Machine Learning, SQL, NLP"
                  value={newSkills}
                  onChange={e => setNewSkills(e.target.value)}
                />
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', background: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={newEnableCGPA}
                    onChange={e => setNewEnableCGPA(e.target.checked)}
                  />
                  <span>Enable CGPA Screening</span>
                </label>

                {newEnableCGPA && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                    <div>
                      <small className="eyebrow">MINIMUM CGPA</small>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', background: 'var(--card)' }}
                        placeholder="7.0"
                        value={newMinCGPA}
                        onChange={e => setNewMinCGPA(e.target.value)}
                      />
                    </div>
                    <div>
                      <small className="eyebrow">CGPA SCALE</small>
                      <select
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', background: 'var(--card)' }}
                        value={newCgpaScale}
                        onChange={e => setNewCgpaScale(e.target.value)}
                      >
                        <option value="10">10 (Standard 10-point)</option>
                        <option value="4">4.0 (US 4-point)</option>
                        <option value="5">5.0 (5-point scale)</option>
                        <option value="100">100 (Percentage %)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="button" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </button>
              <button
                className="button primary"
                onClick={() => {
                  if (newTitle.trim()) {
                    const required = newSkills.split(',').map(s => s.trim()).filter(Boolean)
                    const minVal = parseFloat(newMinCGPA)
                    const scaleVal = parseFloat(newCgpaScale)
                    const newId = addJob({
                      title: newTitle.trim(),
                      department: newDept,
                      required: required.length > 0 ? required : ['Python', 'Machine Learning', 'SQL', 'NLP'],
                      preferred: ['Cloud Platform', 'Docker'],
                      experience: newExp,
                      education: newEdu,
                      location: newLoc,
                      description: `Requisition for ${newTitle.trim()} in ${newDept} located in ${newLoc}.`,
                      enableCGPAScreening: newEnableCGPA,
                      minimumCGPA: newEnableCGPA && !isNaN(minVal) ? minVal : undefined,
                      cgpaScale: !isNaN(scaleVal) ? scaleVal : 10,
                      cgpaMode: newCgpaMode,
                    })
                    setCreateModalOpen(false)
                    setNewTitle('')
                    router.push(`/jobs/${newId}`)
                  }
                }}
              >
                Save Job Requisition
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
