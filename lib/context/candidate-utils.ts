export interface CandidateProfileState {
  candidate: any
  completionRate: number
  hasResume: boolean
}

export function computeProfileCompletion(c?: any): number {
  if (!c) return 0
  let score = 0
  if (c.name && c.name.trim()) score += 15
  if (c.email && c.email.trim()) score += 15
  if (c.phone && c.phone.trim()) score += 10
  if (c.skills && c.skills.length > 0) score += 20
  if (c.education && c.education.trim()) score += 15
  if (c.experience !== undefined && c.experience > 0) score += 10
  if (c.cgpa !== undefined) score += 5
  if (c.resumeFile) score += 10
  return Math.min(100, score)
}
