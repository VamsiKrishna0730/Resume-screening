'use client'

import React, { use, useEffect } from 'react'
import { ScreeningView } from '@/components/screening/ScreeningView'
import { useApp } from '@/lib/context/AppContext'

export default function ScreeningJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = use(params)
  const jobId = resolvedParams.jobId
  const { setSelectedJobId } = useApp()

  useEffect(() => {
    if (jobId) {
      setSelectedJobId(jobId)
    }
  }, [jobId, setSelectedJobId])

  return <ScreeningView />
}
