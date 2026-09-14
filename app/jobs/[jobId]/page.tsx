'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BriefcaseBusiness, ArrowLeft, Gauge, Check, Edit, Copy, Archive, Trash2, X, AlertTriangle } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = use(params)
  const jobId = resolvedParams.jobId
  const router = useRouter()

  const { jobsList, setSelectedJobId, editJob, duplicateJob, archiveJob, deleteJob } = useApp()
  const job = jobsList.find(j => j.id === jobId) || jobsList[0]

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Edit form state
  const [title, setTitle] = useState(job?.title || '')
  const [dept, setDept] = useState(job?.department || '')
  const [exp, setExp] = useState(job?.experience || '')
  const [edu, setEdu] = useState(job?.education || '')
  const [loc, setLoc] = useState(job?.location || 'Hyderabad, IN')
  const [reqSkills, setReqSkills] = useState(job?.required?.join(', ') || '')
  const [prefSkills, setPrefSkills] = useState(job?.preferred?.join(', ') || '')
  const [desc, setDesc] = useState(job?.description || '')
  const [enableCGPA, setEnableCGPA] = useState(job?.enableCGPAScreening ?? (job?.minimumCGPA !== undefined))
  const [minCGPA, setMinCGPA] = useState(job?.minimumCGPA ? String(job.minimumCGPA) : '7.0')
  const [cgpaScale, setCgpaScale] = useState(job?.cgpaScale ? String(job.cgpaScale) : '10')

  const notify = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const handleEditSave = () => {
    if (!title.trim()) return
    const required = reqSkills.split(',').map(s => s.trim()).filter(Boolean)
    const preferred = prefSkills.split(',').map(s => s.trim()).filter(Boolean)
    const minVal = parseFloat(minCGPA)
    const scaleVal = parseFloat(cgpaScale)

    editJob(job.id, {
      title: title.trim(),
      department: dept,
      experience: exp,
      education: edu,
      location: loc,
      required: required.length ? required : ['Python'],
      preferred,
      description: desc,
      enableCGPAScreening: enableCGPA,
      minimumCGPA: enableCGPA && !isNaN(minVal) ? minVal : undefined,
      cgpaScale: !isNaN(scaleVal) ? scaleVal : 10,
      cgpaMode: 'HARD',
    })
    setEditOpen(false)
    notify('Job updated successfully')
  }

  const handleDuplicate = () => {
    const newId = duplicateJob(job.id)
    notify(`Job duplicated as ${newId}`)
    router.push(`/jobs/${newId}`)
  }

  const handleArchive = () => {
    archiveJob(job.id)
    notify(job.status === 'Archived' ? 'Job restored to Active' : 'Job archived')
  }

  const handleDelete = () => {
    deleteJob(job.id)
    router.push('/jobs')
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <Link href="/jobs" className="text-button" style={{ marginBottom: '8px', display: 'inline-flex' }}>
            <ArrowLeft size={14} /> Back to Job Library
          </Link>
          <p className="eyebrow">{job.id} · JOB REQUISITION DETAIL</p>
          <h1>{job.title}</h1>
          <p className="lede">{job.department} · {job.experience} · {job.education} · {job.location || 'Hyderabad, IN'}</p>
        </div>
        <div className="heading-actions">
          <button className="button outline" onClick={() => setEditOpen(true)}>
            <Edit size={14} /> Edit
          </button>
          <button className="button outline" onClick={handleDuplicate}>
            <Copy size={14} /> Duplicate
          </button>
          <button className="button outline" onClick={handleArchive}>
            <Archive size={14} /> {job.status === 'Archived' ? 'Restore' : 'Archive'}
          </button>
          <button className="button outline" onClick={() => setDeleteOpen(true)} style={{ color: 'var(--destructive, #ef4444)' }}>
            <Trash2 size={14} /> Delete
          </button>
          <Link href={`/screening/${job.id}`}>
            <button className="button primary" onClick={() => setSelectedJobId(job.id)}>
              <Gauge size={16} /> Screen Candidates
            </button>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className="toast" role="status" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
          <Check size={15} /> {toastMsg}
        </div>
      )}

      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-head">
          <div>
            <h2>Job Description & Requirements</h2>
            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Status: <Badge t={job.status === 'Archived' ? 'neutral' : 'teal'}>{job.status || 'Active'}</Badge></p>
          </div>
          <Badge t="teal">{job.candidates} candidates in pool</Badge>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', lineHeight: '1.6', marginTop: '10px' }}>
          {job.description || 'Design and execute ML model evaluation pipelines, data preprocessing, and production deployment.'}
        </p>

        <div style={{ marginTop: '20px' }}>
          <h3>Academic & CGPA Screening</h3>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {job.enableCGPAScreening !== false && job.minimumCGPA ? (
              <Badge t="teal">
                <Check size={12} style={{ marginRight: '4px' }} /> CGPA Screening: ON · Min {job.minimumCGPA} / {job.cgpaScale || 10}
              </Badge>
            ) : (
              <Badge t="neutral">CGPA Screening: Disabled / None</Badge>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Required Core Skills</h3>
          <div className="tags" style={{ marginTop: '8px' }}>
            {job.required.map(s => (
              <Badge key={s} t="teal">
                <Check size={12} style={{ marginRight: '4px' }} /> {s}
              </Badge>
            ))}
          </div>
        </div>

        {job.preferred.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h3>Preferred Optional Skills</h3>
            <div className="tags" style={{ marginTop: '8px' }}>
              {job.preferred.map(s => (
                <Badge key={s} t="neutral">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editOpen && (
        <div className="drawer-backdrop" onClick={() => setEditOpen(false)} role="dialog" aria-modal="true">
          <div className="panel" onClick={e => e.stopPropagation()} style={{ width: 'min(540px, 92%)', margin: 'auto', background: 'var(--card)', borderRadius: '8px', padding: '24px' }}>
            <div className="panel-head">
              <h2>Edit Job Requisition</h2>
              <button className="icon-button" onClick={() => setEditOpen(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <div>
                <small className="eyebrow">JOB TITLE</small>
                <input style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <small className="eyebrow">DEPARTMENT</small>
                <input style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} value={dept} onChange={e => setDept(e.target.value)} />
              </div>
              <div>
                <small className="eyebrow">LOCATION</small>
                <input style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} value={loc} onChange={e => setLoc(e.target.value)} />
              </div>
              <div>
                <small className="eyebrow">REQUIRED SKILLS (COMMA SEPARATED)</small>
                <input style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} value={reqSkills} onChange={e => setReqSkills(e.target.value)} />
              </div>
              <div>
                <small className="eyebrow">JOB DESCRIPTION</small>
                <textarea style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', minHeight: '80px' }} value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', background: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={enableCGPA}
                    onChange={e => setEnableCGPA(e.target.checked)}
                  />
                  <span>Enable CGPA Screening</span>
                </label>

                {enableCGPA && (
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
                        value={minCGPA}
                        onChange={e => setMinCGPA(e.target.value)}
                      />
                    </div>
                    <div>
                      <small className="eyebrow">CGPA SCALE</small>
                      <select
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', background: 'var(--card)' }}
                        value={cgpaScale}
                        onChange={e => setCgpaScale(e.target.value)}
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
              <button className="button" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="button primary" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOpen && (
        <div className="drawer-backdrop" onClick={() => setDeleteOpen(false)} role="dialog" aria-modal="true">
          <div className="panel" onClick={e => e.stopPropagation()} style={{ width: 'min(440px, 92%)', margin: 'auto', background: 'var(--card)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <AlertTriangle size={24} color="#ef4444" />
              <h3>Confirm Deletion</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{job.title}</strong> ({job.id})? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="button" onClick={() => setDeleteOpen(false)}>Cancel</button>
              <button className="button" style={{ background: '#ef4444', color: '#fff' }} onClick={handleDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
