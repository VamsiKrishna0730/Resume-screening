'use client'

import React, { useState } from 'react'
import { X, FileText, Upload } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

interface ResumeUploadModalProps {
  onClose: () => void
  onNotify: (msg: string, subject?: string) => void
}

export function ResumeUploadModal({ onClose, onNotify }: ResumeUploadModalProps) {
  const { addParsedCandidate } = useApp()
  const [resumeText, setResumeText] = useState('')

  const sampleResume = `Name: Dr. Aris Thorne
Education: MSc Artificial Intelligence
Experience: 5 years
Skills: Python, PyTorch, SQL, NLP, Docker, Kubernetes
Summary: Experienced Senior AI Engineer specializing in NLP pipelines, PyTorch neural networks, and scalable MLOps model serving.`

  const handleParse = () => {
    if (!resumeText.trim()) return
    addParsedCandidate(resumeText.trim())
    onNotify('Resume parsed & added to candidate pool', 'Resume Parser')
    onClose()
  }

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Resume Parser">
      <div
        className="panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(560px, 92%)',
          margin: 'auto',
          background: 'var(--card)',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <div className="panel-head">
          <div>
            <p className="eyebrow">RESUME PARSER & PREPROCESSING</p>
            <h2>Parse new candidate resume</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', margin: '8px 0 16px' }}>
          Paste raw resume text below to extract candidate entity features, skills, education, and score against the active job.
        </p>

        <textarea
          style={{ width: '100%', minHeight: '160px', marginBottom: '12px', fontFamily: 'monospace', fontSize: '11px' }}
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
          placeholder="Paste resume content here..."
        />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="button outline"
            onClick={() => setResumeText(sampleResume)}
          >
            <FileText size={14} /> Load sample text
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button primary" onClick={handleParse} disabled={!resumeText.trim()}>
              <Upload size={14} /> Parse Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
