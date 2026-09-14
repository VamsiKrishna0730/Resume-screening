'use client'

import React from 'react'
import { Check, Activity } from 'lucide-react'
import { pipeline } from '@/lib/demo-data'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export function PipelinePanel() {
  const { simulationStep } = useApp()

  return (
    <div className="pipeline panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">LIVE RESEARCH SIMULATION</p>
          <h2>Resume-to-review pipeline</h2>
        </div>
        <Badge t="teal">Synthetic workflow</Badge>
      </div>
      <div className="pipeline-steps">
        {pipeline.map((p, i) => {
          const isDone = i < simulationStep
          const isCurrent = i === simulationStep
          return (
            <div key={p} className={isCurrent ? 'current' : ''}>
              <span>
                {isDone ? <Check size={13} /> : isCurrent ? <Activity size={13} /> : <span>{i + 1}</span>}
              </span>
              <small>{p}</small>
            </div>
          )
        })}
      </div>
    </div>
  )
}
