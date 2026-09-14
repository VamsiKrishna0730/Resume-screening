import { Candidate, Job } from './types'

function parseRequiredYears(expStr: string): number {
  const match = expStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 2
}

export function calculateExperienceScore(candidate: Candidate, job: Job): number {
  const reqYears = parseRequiredYears(job.experience)
  const candYears = candidate.experience

  if (candYears >= reqYears) {
    const surplus = candYears - reqYears
    const bonus = Math.min(10, surplus * 2)
    return Math.min(98, Math.round(88 + bonus))
  } else {
    const deficit = reqYears - candYears
    const penalty = deficit * 18
    return Math.max(45, Math.round(85 - penalty))
  }
}
