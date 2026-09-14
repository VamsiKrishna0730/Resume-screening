'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, FlaskConical, Download } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { exportModelComparisonCSV } from '@/lib/experiments/exporter'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export default function ExperimentDetailPage({ params }: { params: Promise<{ experimentId: string }> }) {
  const resolvedParams = use(params)
  const experimentId = resolvedParams.experimentId

  const { experimentsList } = useApp()
  const exp = experimentsList.find(e => e.name.toLowerCase().includes(experimentId.toLowerCase())) || experimentsList[0]

  return (
    <>
      <div className="page-heading">
        <div>
          <Link href="/experiments" className="text-button" style={{ marginBottom: '8px', display: 'inline-flex' }}>
            <ArrowLeft size={14} /> Back to Experiment Lab
          </Link>
          <p className="eyebrow">EXPERIMENT RUN DETAIL</p>
          <h1>{exp.name}</h1>
          <p className="lede">Reproducible Evaluation Metric Report</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '20px' }}>
        <div className="stat">
          <div className="stat-top"><span>Accuracy</span><FlaskConical size={16} /></div>
          <strong>{exp.accuracy.toFixed(2)}</strong>
          <small>Classification accuracy</small>
        </div>
        <div className="stat">
          <div className="stat-top"><span>Precision</span><FlaskConical size={16} /></div>
          <strong>{exp.precision.toFixed(2)}</strong>
          <small>Precision@5</small>
        </div>
        <div className="stat">
          <div className="stat-top"><span>Recall</span><FlaskConical size={16} /></div>
          <strong>{exp.recall.toFixed(2)}</strong>
          <small>Recall@5</small>
        </div>
        <div className="stat">
          <div className="stat-top"><span>NDCG@10</span><FlaskConical size={16} /></div>
          <strong>{exp.ndcg.toFixed(2)}</strong>
          <small>Ranking discount gain</small>
        </div>
      </div>
    </>
  )
}
