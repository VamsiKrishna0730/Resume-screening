'use client'

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { Candidate, CandidateStatus, Job, MatchingWeights, CandidateMatchResult, CGPAScreeningMode, Activity, CandidateApplication } from '../matching/types'
import { jobs as seedJobs, candidates as seedCandidates, seedActivities } from '../demo-data'
import { scoreCandidate, DEFAULT_WEIGHTS } from '../matching/score'
import { screenCandidateCGPA } from '../matching/cgpa'
import { auditFairness, FairnessReport } from '../fairness/engine'
import { ModelVersion, INITIAL_MODELS, createAdaptedModelVersion } from '../adaptive/engine'
import { evaluateExperiments, generateAblationTable, ExperimentMetric, AblationRow } from '../experiments/evaluator'
import { parseRawResumeText } from '../parsing/resumeParser'
import { createActivityId, findDuplicateActivityIds, normalizeActivities } from './activity-utils'

export { createActivityId, findDuplicateActivityIds, normalizeActivities }

interface AppContextType {
  jobsList: Job[]
  selectedJobId: string
  selectedJob: Job
  setSelectedJobId: (id: string) => void
  addJob: (jobData: {
    title: string
    department: string
    required: string[]
    preferred?: string[]
    experience?: string
    education?: string
    location?: string
    description?: string
    enableCGPAScreening?: boolean
    minimumCGPA?: number
    cgpaScale?: number
    cgpaMode?: CGPAScreeningMode
  }) => string
  editJob: (id: string, updated: Partial<Job>) => void
  duplicateJob: (id: string) => string
  archiveJob: (id: string) => void
  deleteJob: (id: string) => void
  candidatesList: Candidate[]
  updateCandidateProfile: (id: string, updated: Partial<Candidate>) => void
  uploadCandidateResume: (candidateId: string, fileInfo: { name: string; size: number; type: string; rawText: string }) => Candidate
  deleteCandidateResume: (candidateId: string) => void
  applicationsList: import('../matching/types').CandidateApplication[]
  applyForJob: (jobId: string, candidateId?: string) => { success: boolean; message: string; application?: import('../matching/types').CandidateApplication }
  withdrawApplication: (applicationId: string) => void
  weights: MatchingWeights
  setWeights: React.Dispatch<React.SetStateAction<MatchingWeights>>
  matchResultsMap: Record<string, CandidateMatchResult>
  rankedCandidates: Candidate[]
  statuses: Record<string, CandidateStatus>
  setCandidateStatus: (id: string, status: CandidateStatus) => void
  feedbackMap: Record<string, string>
  setCandidateFeedback: (id: string, feedback: string) => void
  notesMap: Record<string, string>
  addCandidateNote: (id: string, note: string) => void
  fairnessReport: FairnessReport
  modelsList: ModelVersion[]
  activeModelVersion: string
  setSelectedModelVersion: (v: string) => void
  triggerAdaptiveLearningRun: () => void
  experimentsList: ExperimentMetric[]
  ablationList: AblationRow[]
  activitiesList: Activity[]
  addActivityEvent: (event: string, subject: string, status?: string) => void
  simulationRunning: boolean
  setSimulationRunning: React.Dispatch<React.SetStateAction<boolean>>
  simulationStep: number
  simulationSpeed: 'Slow' | 'Normal' | 'Fast'
  setSimulationSpeed: (speed: 'Slow' | 'Normal' | 'Fast') => void
  addParsedCandidate: (rawResumeText: string) => Candidate
  resetDemo: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [jobsList, setJobsList] = useState<Job[]>(seedJobs)
  const [selectedJobId, setSelectedJobId] = useState<string>('JOB-001')
  const [candidatesList, setCandidatesList] = useState<Candidate[]>(seedCandidates)
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_WEIGHTS)
  const [statuses, setStatuses] = useState<Record<string, CandidateStatus>>({})
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({})
  const [notesMap, setNotesMap] = useState<Record<string, string>>({})
  const [modelsList, setModelsList] = useState<ModelVersion[]>(INITIAL_MODELS)
  const [activeModelVersion, setSelectedModelVersion] = useState<string>('v1.3.2')
  const [activitiesList, setActivitiesList] = useState(seedActivities)
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false)
  const [simulationStep, setSimulationStep] = useState<number>(0)
  const [simulationSpeed, setSimulationSpeed] = useState<'Slow' | 'Normal' | 'Fast'>('Normal')

  const [applicationsList, setApplicationsList] = useState<CandidateApplication[]>([])

  const selectedJob = useMemo(() => {
    return jobsList.find(j => j.id === selectedJobId) || jobsList[0]
  }, [jobsList, selectedJobId])

  const matchResultsMap = useMemo(() => {
    const map: Record<string, CandidateMatchResult> = {}
    candidatesList.forEach(c => {
      map[c.id] = scoreCandidate(c, selectedJob, weights)
    })
    return map
  }, [candidatesList, selectedJob, weights])

  const rankedCandidates = useMemo(() => {
    return [...candidatesList].sort((a, b) => {
      const scoreA = matchResultsMap[a.id]?.totalScore || 0
      const scoreB = matchResultsMap[b.id]?.totalScore || 0
      return scoreB - scoreA
    })
  }, [candidatesList, matchResultsMap])

  const fairnessReport = useMemo(() => {
    return auditFairness(candidatesList, statuses)
  }, [candidatesList, statuses])

  const experimentsList = useMemo(() => evaluateExperiments(), [])
  const ablationList = useMemo(() => generateAblationTable(), [])

  const addActivityEvent = (event: string, subject: string, status = 'Simulated') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newEvent: Activity = {
      id: createActivityId(),
      time: timeStr,
      event,
      subject,
      status,
    }
    setActivitiesList(prev => {
      // Prevent inserting duplicate activity ID
      if (prev.some(existing => existing.id === newEvent.id)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[PRISM] Duplicate activity ID prevented from insertion:', newEvent.id)
        }
        return prev
      }
      return [...prev, newEvent]
    })
  }

  const setCandidateStatus = (id: string, status: CandidateStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
    const cand = candidatesList.find(c => c.id === id)
    addActivityEvent(`Candidate ${status.toLowerCase()}`, cand?.name || id, 'Complete')
  }

  const setCandidateFeedback = (id: string, feedback: string) => {
    setFeedbackMap(prev => ({ ...prev, [id]: feedback }))
    const cand = candidatesList.find(c => c.id === id)
    addActivityEvent(`Feedback (${feedback}) received`, cand?.name || id, 'Queued')
  }

  const addCandidateNote = (id: string, note: string) => {
    setNotesMap(prev => ({ ...prev, [id]: note }))
    const cand = candidatesList.find(c => c.id === id)
    addActivityEvent('Review note added', cand?.name || id, 'Saved')
  }

  const triggerAdaptiveLearningRun = () => {
    const totalFeedbackCount = Object.keys(feedbackMap).length + 20
    const updatedModels = createAdaptedModelVersion(modelsList, totalFeedbackCount)
    setModelsList(updatedModels)
    const latestVersion = updatedModels[updatedModels.length - 1].version
    setSelectedModelVersion(latestVersion)
    addActivityEvent('Adaptive learning run completed', `${modelsList[modelsList.length - 1].version} → ${latestVersion}`, 'Complete')
  }

  const addParsedCandidate = (rawResumeText: string): Candidate => {
    const newCand = parseRawResumeText(rawResumeText, candidatesList.length)
    setCandidatesList(prev => [newCand, ...prev])
    addActivityEvent('Resume parsed & candidate added', newCand.name, 'Complete')
    return newCand
  }

  const updateCandidateProfile = (id: string, updated: Partial<Candidate>) => {
    setCandidatesList(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, ...updated }
      }
      return c
    }))
    addActivityEvent('Candidate profile updated', id, 'Complete')
  }

  const uploadCandidateResume = (
    candidateId: string,
    fileInfo: { name: string; size: number; type: string; rawText: string }
  ): Candidate => {
    const parsed = parseRawResumeText(fileInfo.rawText, candidatesList.length)
    const existingIndex = candidatesList.findIndex(c => c.id === candidateId)

    const updatedCandidate: Candidate = {
      ...(existingIndex >= 0 ? candidatesList[existingIndex] : parsed),
      id: candidateId || parsed.id,
      name: parsed.name !== `Candidate C-${1000 + candidatesList.length + 1}` ? parsed.name : (existingIndex >= 0 ? candidatesList[existingIndex].name : parsed.name),
      initials: parsed.initials,
      skills: Array.from(new Set([...(existingIndex >= 0 ? candidatesList[existingIndex].skills : []), ...parsed.skills])),
      education: parsed.education || (existingIndex >= 0 ? candidatesList[existingIndex].education : 'BSc Computer Science'),
      experience: parsed.experience || (existingIndex >= 0 ? candidatesList[existingIndex].experience : 2.5),
      cgpa: parsed.cgpa !== undefined ? parsed.cgpa : (existingIndex >= 0 ? candidatesList[existingIndex].cgpa : undefined),
      cgpaScale: parsed.cgpaScale !== undefined ? parsed.cgpaScale : (existingIndex >= 0 ? candidatesList[existingIndex].cgpaScale : 10),
      projects: parsed.projects || (existingIndex >= 0 ? candidatesList[existingIndex].projects : []),
      certifications: parsed.certifications || (existingIndex >= 0 ? candidatesList[existingIndex].certifications : []),
      email: parsed.email || (existingIndex >= 0 ? candidatesList[existingIndex].email : undefined),
      phone: parsed.phone || (existingIndex >= 0 ? candidatesList[existingIndex].phone : undefined),
      source: 'Candidate Portal',
      resumeFile: {
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.type,
        uploadedAt: new Date().toISOString(),
        rawTextSnippet: fileInfo.rawText.slice(0, 500)
      }
    }

    if (existingIndex >= 0) {
      setCandidatesList(prev => prev.map((c, i) => i === existingIndex ? updatedCandidate : c))
    } else {
      setCandidatesList(prev => [updatedCandidate, ...prev])
    }

    addActivityEvent('Candidate resume uploaded', updatedCandidate.name, 'Complete')
    return updatedCandidate
  }

  const deleteCandidateResume = (candidateId: string) => {
    setCandidatesList(prev => prev.map(c => {
      if (c.id === candidateId) {
        const copy = { ...c }
        delete copy.resumeFile
        return copy
      }
      return c
    }))
    addActivityEvent('Candidate resume removed', candidateId, 'Complete')
  }

  const applyForJob = (
    jobId: string,
    candidateId?: string
  ): { success: boolean; message: string; application?: CandidateApplication } => {
    const job = jobsList.find(j => j.id === jobId)
    if (!job) {
      return { success: false, message: 'Requisition not found.' }
    }

    const candidate = candidatesList.find(c => c.id === candidateId) || candidatesList[0]
    if (!candidate) {
      return { success: false, message: 'Candidate profile required before submitting an application.' }
    }

    // Check if already applied
    const alreadyApplied = applicationsList.some(
      a => a.jobId === jobId && a.candidateId === candidate.id && a.status !== 'Withdrawn'
    )
    if (alreadyApplied) {
      return { success: false, message: 'You have already applied for this position.' }
    }

    // Evaluate CGPA eligibility rule
    const isCgpaScreeningActive = job.enableCGPAScreening !== false && job.minimumCGPA !== undefined && job.minimumCGPA > 0
    const cgpaAssessment = screenCandidateCGPA(
      candidate.cgpa,
      candidate.cgpaScale || 10,
      isCgpaScreeningActive ? job.minimumCGPA : undefined,
      job.cgpaScale || 10,
      job.cgpaMode || 'HARD'
    )

    // Calculate match score
    const match = scoreCandidate(candidate, job, weights)

    const newApp: CandidateApplication = {
      id: `APP-${Date.now().toString().slice(-6)}`,
      candidateId: candidate.id,
      candidateEmail: candidate.email || 'candidate@prism-portal.org',
      candidateName: candidate.name,
      jobId: job.id,
      jobTitle: job.title,
      company: 'PRISM Enterprise AI',
      department: job.department,
      location: job.location || 'Remote',
      appliedAt: new Date().toISOString(),
      status: 'Applied',
      matchScore: match.totalScore,
      cgpaEligible: cgpaAssessment.pass,
      cgpaScreeningStatus: cgpaAssessment.status,
      cgpaScreeningReason: cgpaAssessment.reason
    }

    setApplicationsList(prev => [newApp, ...prev])
    addActivityEvent(`Job application submitted: ${job.title}`, candidate.name, 'Complete')
    return { success: true, message: 'Application submitted successfully!', application: newApp }
  }

  const withdrawApplication = (applicationId: string) => {
    setApplicationsList(prev => prev.map(a => a.id === applicationId ? { ...a, status: 'Withdrawn' } : a))
    addActivityEvent('Application withdrawn', applicationId, 'Withdrawn')
  }

  const addJob = (jobData: {
    title: string
    department: string
    required: string[]
    preferred?: string[]
    experience?: string
    education?: string
    location?: string
    description?: string
    enableCGPAScreening?: boolean
    minimumCGPA?: number
    cgpaScale?: number
    cgpaMode?: CGPAScreeningMode
  }): string => {
    const newId = `JOB-00${jobsList.length + 1}`
    const newJob: Job = {
      id: newId,
      title: jobData.title,
      department: jobData.department,
      required: jobData.required,
      preferred: jobData.preferred || [],
      experience: jobData.experience || '3+ years',
      education: jobData.education || 'BSc Computer Science',
      location: jobData.location || 'Hyderabad, IN',
      status: 'Active',
      candidates: 0,
      description: jobData.description || 'Custom job requisition specification.',
      enableCGPAScreening: jobData.enableCGPAScreening,
      minimumCGPA: jobData.minimumCGPA,
      cgpaScale: jobData.cgpaScale || 10,
      cgpaMode: jobData.cgpaMode || 'HARD',
    }
    setJobsList(prev => [newJob, ...prev])
    setSelectedJobId(newId)
    addActivityEvent(`Job created: ${newJob.title}`, newId, 'Complete')
    return newId
  }

  const editJob = (id: string, updated: Partial<Job>) => {
    setJobsList(prev => prev.map(j => j.id === id ? { ...j, ...updated } : j))
    addActivityEvent(`Job updated: ${id}`, id, 'Complete')
  }

  const duplicateJob = (id: string): string => {
    const source = jobsList.find(j => j.id === id)
    if (!source) return id
    const newId = `JOB-00${jobsList.length + 1}`
    const copy: Job = {
      ...source,
      id: newId,
      title: `${source.title} (Copy)`,
      candidates: 0,
      status: 'Active',
    }
    setJobsList(prev => [copy, ...prev])
    setSelectedJobId(newId)
    addActivityEvent(`Job duplicated: ${copy.title}`, newId, 'Complete')
    return newId
  }

  const archiveJob = (id: string) => {
    setJobsList(prev => prev.map(j => j.id === id ? { ...j, status: j.status === 'Archived' ? 'Active' : 'Archived' } : j))
    addActivityEvent(`Job status toggled: ${id}`, id, 'Complete')
  }

  const deleteJob = (id: string) => {
    setJobsList(prev => prev.filter(j => j.id !== id))
    addActivityEvent(`Job deleted: ${id}`, id, 'Deleted')
  }

  // LocalStorage persistence
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('prism_jobs')
      if (savedJobs) setJobsList(JSON.parse(savedJobs))
      const savedCands = localStorage.getItem('prism_candidates')
      if (savedCands) setCandidatesList(JSON.parse(savedCands))
      const savedWeights = localStorage.getItem('prism_weights')
      if (savedWeights) setWeights(JSON.parse(savedWeights))
      const savedStatuses = localStorage.getItem('prism_statuses')
      if (savedStatuses) setStatuses(JSON.parse(savedStatuses))
      const savedActivities = localStorage.getItem('prism_activities')
      if (savedActivities) {
        const parsed = JSON.parse(savedActivities)
        if (Array.isArray(parsed)) {
          const duplicates = findDuplicateActivityIds(parsed)
          if (duplicates.length > 0 && process.env.NODE_ENV === 'development') {
            console.warn('[PRISM] Duplicate activity IDs detected in persisted storage:', duplicates)
          }
          setActivitiesList(normalizeActivities(parsed))
        }
      }
      const savedApps = localStorage.getItem('prism_applications')
      if (savedApps) setApplicationsList(JSON.parse(savedApps))
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('prism_jobs', JSON.stringify(jobsList))
    } catch (e) {}
  }, [jobsList])

  useEffect(() => {
    try {
      localStorage.setItem('prism_candidates', JSON.stringify(candidatesList))
    } catch (e) {}
  }, [candidatesList])

  useEffect(() => {
    try {
      localStorage.setItem('prism_applications', JSON.stringify(applicationsList))
    } catch (e) {}
  }, [applicationsList])

  useEffect(() => {
    try {
      localStorage.setItem('prism_weights', JSON.stringify(weights))
    } catch (e) {}
  }, [weights])

  useEffect(() => {
    try {
      localStorage.setItem('prism_statuses', JSON.stringify(statuses))
    } catch (e) {}
  }, [statuses])

  useEffect(() => {
    try {
      localStorage.setItem('prism_activities', JSON.stringify(activitiesList))
    } catch (e) {}
  }, [activitiesList])

  const resetDemo = () => {
    try {
      localStorage.removeItem('prism_jobs')
      localStorage.removeItem('prism_candidates')
      localStorage.removeItem('prism_applications')
      localStorage.removeItem('prism_weights')
      localStorage.removeItem('prism_statuses')
      localStorage.removeItem('prism_activities')
    } catch (e) {}
    setStatuses({})
    setFeedbackMap({})
    setNotesMap({})
    setJobsList(seedJobs)
    setCandidatesList(seedCandidates)
    setApplicationsList([])
    setWeights(DEFAULT_WEIGHTS)
    setModelsList(INITIAL_MODELS)
    setSelectedModelVersion('v1.3.2')
    setActivitiesList(normalizeActivities(seedActivities))
    setSimulationRunning(false)
    setSimulationStep(0)
    setSelectedJobId('JOB-001')
    addActivityEvent('Demo reset to defaults', 'System', 'Reset')
  }

  const speedIntervalMs = simulationSpeed === 'Slow' ? 5000 : simulationSpeed === 'Fast' ? 1200 : 2600

  useEffect(() => {
    if (!simulationRunning) return
    const timer = setInterval(() => {
      setSimulationStep(s => (s + 1) % 8)
    }, speedIntervalMs)
    return () => clearInterval(timer)
  }, [simulationRunning, speedIntervalMs])

  return (
    <AppContext.Provider
      value={{
        jobsList,
        selectedJobId,
        selectedJob,
        setSelectedJobId,
        addJob,
        editJob,
        duplicateJob,
        archiveJob,
        deleteJob,
        candidatesList,
        updateCandidateProfile,
        uploadCandidateResume,
        deleteCandidateResume,
        applicationsList,
        applyForJob,
        withdrawApplication,
        weights,
        setWeights,
        matchResultsMap,
        rankedCandidates,
        statuses,
        setCandidateStatus,
        feedbackMap,
        setCandidateFeedback,
        notesMap,
        addCandidateNote,
        fairnessReport,
        modelsList,
        activeModelVersion,
        setSelectedModelVersion,
        triggerAdaptiveLearningRun,
        experimentsList,
        ablationList,
        activitiesList,
        addActivityEvent,
        simulationRunning,
        setSimulationRunning,
        simulationStep,
        simulationSpeed,
        setSimulationSpeed,
        addParsedCandidate,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
