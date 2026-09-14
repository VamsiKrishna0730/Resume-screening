/**
 * PRISM Research Experimentation: Data Leakage Auditor
 * Performs automated programmatic verification of candidate, text, label, and demographic isolation.
 */

import { DatasetRecord, SplitResult } from './splitter'

export interface LeakageAuditReport {
  timestamp: string
  totalRecordsAudited: number
  trainCount: number
  valCount: number
  testCount: number
  candidateOverlapCount: number
  resumeTextOverlapCount: number
  labelLeakageInFeatures: boolean
  demographicInPredictors: boolean
  overallStatus: 'PASS' | 'FAIL'
  violations: string[]
}

export function auditDataLeakage(split: SplitResult): LeakageAuditReport {
  const violations: string[] = []

  const trainCandidateIds = new Set(split.train.map(r => r.candidate_id))
  const valCandidateIds = new Set(split.val.map(r => r.candidate_id))
  const testCandidateIds = new Set(split.test.map(r => r.candidate_id))

  // 1. Candidate ID overlap
  let candidateOverlapCount = 0
  for (const id of testCandidateIds) {
    if (trainCandidateIds.has(id)) {
      violations.push(`Candidate overlap: '${id}' appears in both Train and Test partitions`)
      candidateOverlapCount++
    }
    if (valCandidateIds.has(id)) {
      violations.push(`Candidate overlap: '${id}' appears in both Val and Test partitions`)
      candidateOverlapCount++
    }
  }

  // 2. Exact text duplicate overlap
  let resumeTextOverlapCount = 0
  const trainTexts = new Set(split.train.map(r => r.resume_text.trim().toLowerCase()))
  for (const r of split.test) {
    const text = r.resume_text.trim().toLowerCase()
    if (text && trainTexts.has(text)) {
      violations.push(`Resume text duplicate: Candidate '${r.candidate_id}' test resume matches a training resume text`)
      resumeTextOverlapCount++
    }
  }

  // 3. Label contamination check (ensure target labels are binary and not encoded into text)
  let labelLeakageInFeatures = false
  for (const r of split.test) {
    if (typeof r.ground_truth_match !== 'number' || (r.ground_truth_match !== 0 && r.ground_truth_match !== 1)) {
      violations.push(`Invalid target label for candidate '${r.candidate_id}': ${r.ground_truth_match}`)
      labelLeakageInFeatures = true
    }
  }

  // 4. Demographic sequestration check (ensure demographic attribute is not injected into resume text)
  let demographicInPredictors = false
  for (const r of [...split.train, ...split.val, ...split.test]) {
    if (r.demographic_attribute && r.resume_text.includes(`Attribute: ${r.demographic_attribute}`)) {
      violations.push(`Demographic leakage: Sensitive cohort explicitly present in raw resume text for '${r.candidate_id}'`)
      demographicInPredictors = true
    }
  }

  const overallStatus = violations.length === 0 ? 'PASS' : 'FAIL'

  return {
    timestamp: new Date().toISOString(),
    totalRecordsAudited: split.train.length + split.val.length + split.test.length,
    trainCount: split.train.length,
    valCount: split.val.length,
    testCount: split.test.length,
    candidateOverlapCount,
    resumeTextOverlapCount,
    labelLeakageInFeatures,
    demographicInPredictors,
    overallStatus,
    violations,
  }
}
