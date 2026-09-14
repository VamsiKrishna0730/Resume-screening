export type CandidateStatus = 'Recommended' | 'Review' | 'Hold' | 'Rejected' | 'Advanced'

export interface Activity {
  id: string
  time: string
  event: string
  subject: string
  status: string
}

export interface Candidate {
  id: string
  name: string
  initials: string
  education: string
  experience: number
  skills: string[]
  required: string[]
  location: string
  fairness: 'Clear' | 'Review'
  summary: string
  email?: string
  phone?: string
  projects?: string[]
  certifications?: string[]
  cgpa?: number
  cgpaScale?: number
  source?: 'Candidate Portal' | 'Synthetic Pool' | 'Recruiter Upload'
  resumeFile?: {
    name: string
    size: number
    type: string
    uploadedAt: string
    rawTextSnippet?: string
  }
  scoreParts?: {
    lexical: number
    semantic: number
    skills: number
    experience: number
    education: number
    projects: number
    cgpa?: number
  }
  status: CandidateStatus
}

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Withdrawn'

export interface CandidateApplication {
  id: string
  candidateId: string
  candidateEmail: string
  candidateName: string
  jobId: string
  jobTitle: string
  company: string
  department: string
  location: string
  appliedAt: string
  status: ApplicationStatus
  matchScore: number
  cgpaEligible: boolean
  cgpaScreeningStatus: CGPAScreeningStatus
  cgpaScreeningReason: string
}

export type CGPAScreeningMode = 'SOFT' | 'HARD'
export type CGPAScreeningStatus = 'PASS' | 'FAIL' | 'CGPA NOT FOUND' | 'INVALID CGPA'

export interface Job {
  id: string
  title: string
  department: string
  required: string[]
  preferred: string[]
  education: string
  experience: string
  candidates: number
  location?: string
  status?: 'Active' | 'Archived'
  description?: string
  enableCGPAScreening?: boolean
  minimumCGPA?: number
  cgpaScale?: number
  cgpaWeight?: number
  cgpaMode?: CGPAScreeningMode
}

export interface MatchingWeights {
  lexical: number
  semantic: number
  skills: number
  experience: number
  education: number
  projects: number
  cgpa: number
}

export interface SkillAnalysis {
  matchedSkills: string[]
  missingSkills: string[]
  preferredMatched: string[]
  score: number
  coverageRatio: number
}

export interface ExplanationFactor {
  feature: string
  contribution: number
  isPositive: boolean
  description: string
}

export interface CGPAAssessment {
  candidateCGPA?: number
  candidateScale?: number
  normalizedCandidateCGPA?: number
  requiredCGPA?: number
  requiredScale?: number
  normalizedRequiredCGPA?: number
  score: number
  isEligible: boolean
  status: 'Meets Requirement' | 'Below Requirement' | 'Not Provided' | 'Invalid CGPA'
  screeningStatus: CGPAScreeningStatus
  screeningReason: string
  mode: CGPAScreeningMode
  explanation: string
}

export interface CandidateMatchResult {
  candidateId: string
  jobId: string
  totalScore: number
  scoreParts: {
    lexical: number
    semantic: number
    skills: number
    experience: number
    education: number
    projects: number
    cgpa: number
  }
  skillAnalysis: SkillAnalysis
  cgpaAssessment?: CGPAAssessment
  explanations: ExplanationFactor[]
  confidence: 'High' | 'Medium' | 'Low'
  isEligible: boolean
}
