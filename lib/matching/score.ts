import { Candidate, Job, MatchingWeights, CandidateMatchResult } from './types'
import { analyzeSkills } from './skills'
import { calculateLexicalScore } from './lexical'
import { calculateSemanticScore } from './semantic'
import { calculateExperienceScore } from './experience'
import { calculateEducationScore, calculateProjectScore } from './education'
import { evaluateCGPA } from './cgpa'
import { generateExplanations } from './explanations'

export const DEFAULT_WEIGHTS: MatchingWeights = {
  lexical: 0.18,
  semantic: 0.27,
  skills: 0.23,
  experience: 0.14,
  education: 0.08,
  projects: 0.00,
  cgpa: 0.10,
}

export function scoreCandidate(
  candidate: Candidate,
  job: Job,
  weights: MatchingWeights = DEFAULT_WEIGHTS
): CandidateMatchResult {
  const skillAnalysis = analyzeSkills(candidate, job)
  const lexicalScore = calculateLexicalScore(candidate, job)
  const semanticScore = calculateSemanticScore(candidate, job)
  const experienceScore = calculateExperienceScore(candidate, job)
  const educationScore = calculateEducationScore(candidate, job)
  const projectScore = calculateProjectScore(candidate, job)

  // CGPA evaluation (enabled if job.enableCGPAScreening !== false and minimumCGPA is defined)
  const isCgpaScreeningActive = job.enableCGPAScreening !== false && job.minimumCGPA !== undefined && job.minimumCGPA > 0

  const cgpaAssessment = evaluateCGPA(
    candidate.cgpa,
    candidate.cgpaScale || 10.0,
    isCgpaScreeningActive ? job.minimumCGPA : undefined,
    job.cgpaScale || 10.0,
    job.cgpaMode || 'HARD' // Default to HARD screening requirement as required by Admin filter
  )

  const cgpaScore = Math.round(cgpaAssessment.score * 100)

  const scoreParts = {
    lexical: lexicalScore,
    semantic: semanticScore,
    skills: skillAnalysis.score,
    experience: experienceScore,
    education: educationScore,
    projects: projectScore,
    cgpa: cgpaScore,
  }

  // Calculate sum of active weights to allow flexible normalization
  const totalWeight =
    (weights.lexical || 0) +
    (weights.semantic || 0) +
    (weights.skills || 0) +
    (weights.experience || 0) +
    (weights.education || 0) +
    (weights.projects || 0) +
    (weights.cgpa || 0)

  const normWeightFactor = totalWeight > 0 ? 1.0 / totalWeight : 1.0

  const rawTotal = (
    scoreParts.lexical * (weights.lexical || 0) +
    scoreParts.semantic * (weights.semantic || 0) +
    scoreParts.skills * (weights.skills || 0) +
    scoreParts.experience * (weights.experience || 0) +
    scoreParts.education * (weights.education || 0) +
    scoreParts.projects * (weights.projects || 0) +
    scoreParts.cgpa * (weights.cgpa || 0)
  ) * normWeightFactor

  const totalScore = Math.min(99, Math.max(40, Math.round(rawTotal)))
  const confidence = totalScore >= 88 ? 'High' : totalScore >= 75 ? 'Medium' : 'Low'
  const explanations = generateExplanations(candidate, job, skillAnalysis, scoreParts, cgpaAssessment)

  return {
    candidateId: candidate.id,
    jobId: job.id,
    totalScore,
    scoreParts,
    skillAnalysis,
    cgpaAssessment,
    explanations,
    confidence,
    isEligible: cgpaAssessment.isEligible,
  }
}
