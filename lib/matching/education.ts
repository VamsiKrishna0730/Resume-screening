import { Candidate, Job } from './types'

export function calculateEducationScore(candidate: Candidate, job: Job): number {
  const candEdu = candidate.education.toLowerCase()
  const reqEdu = job.education.toLowerCase()

  if (candEdu.includes('phd')) return 98
  if (candEdu.includes('msc') || candEdu.includes('meng')) {
    return reqEdu.includes('phd') ? 85 : 94
  }
  if (candEdu.includes('bsc') || candEdu.includes('btech')) {
    return reqEdu.includes('msc') ? 82 : 90
  }
  return 78
}

export function calculateProjectScore(candidate: Candidate, job: Job): number {
  const summaryLower = candidate.summary.toLowerCase()
  const jobTitleLower = job.title.toLowerCase()

  let matches = 0
  job.required.forEach(req => {
    if (summaryLower.includes(req.toLowerCase())) {
      matches++
    }
  })

  if (jobTitleLower.includes('nlp') && summaryLower.includes('nlp')) matches += 2
  if (jobTitleLower.includes('ml') && summaryLower.includes('ml')) matches += 2

  const score = Math.min(96, Math.max(65, Math.round(72 + matches * 6)))
  return score
}
