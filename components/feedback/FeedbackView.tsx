'use client'

import React from 'react'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export function FeedbackView() {
  const { activitiesList, activeModelVersion } = useApp()

  const feedbackEvents = activitiesList.filter(
    a => a.event.toLowerCase().includes('feedback') || a.event.toLowerCase().includes('candidate') || a.event.toLowerCase().includes('status')
  )

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE</p>
          <h1>Recruiter feedback & adaptive learning</h1>
          <p className="lede">Feedback events trigger simulated adaptive ranking updates.</p>
        </div>
        <Badge t="amber">Illustrative synthetic data</Badge>
      </div>

      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Candidate</th>
              <th>Event Action</th>
              <th>Reason / Rationale</th>
              <th>Learning status</th>
              <th>Model</th>
            </tr>
          </thead>
          <tbody>
            {feedbackEvents.map(a => (
              <tr key={a.id}>
                <td>{a.time}</td>
                <td>{a.subject}</td>
                <td>
                  <Badge t="teal">{a.event}</Badge>
                </td>
                <td>Technical skills & domain fit reviewed</td>
                <td><Badge t="neutral">Recorded · Pending Adaptation</Badge></td>
                <td>{activeModelVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
