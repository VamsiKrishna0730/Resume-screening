import { Candidate, Job, SkillAnalysis } from './types'

const SKILL_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  'react.js': 'react',
  'node.js': 'node.js',
  node: 'node.js',
  k8s: 'kubernetes',
  ml: 'machine learning',
  nlp: 'nlp',
  dl: 'deep learning',
  postgres: 'postgresql',
  scikit: 'scikit-learn',
  sklearn: 'scikit-learn',
  py: 'python',
  cplusplus: 'c++',
  cpp: 'c++',
}

export function normalizeSkill(skill: string): string {
  const clean = skill.trim().toLowerCase()
  return SKILL_ALIASES[clean] || clean
}

export function analyzeSkills(candidate: Candidate, job: Job): SkillAnalysis {
  const candSkillsNorm = candidate.skills.map(normalizeSkill)
  const reqSkillsNorm = job.required.map(normalizeSkill)
  const prefSkillsNorm = job.preferred.map(normalizeSkill)

  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  job.required.forEach((req, idx) => {
    const norm = reqSkillsNorm[idx]
    if (candSkillsNorm.includes(norm)) {
      matchedSkills.push(req)
    } else {
      missingSkills.push(req)
    }
  })

  const preferredMatched: string[] = []
  job.preferred.forEach((pref, idx) => {
    const norm = prefSkillsNorm[idx]
    if (candSkillsNorm.includes(norm)) {
      preferredMatched.push(pref)
    }
  })

  const requiredCount = job.required.length
  const matchedCount = matchedSkills.length
  const coverageRatio = requiredCount > 0 ? matchedCount / requiredCount : 1.0

  const prefBonus = job.preferred.length > 0 ? (preferredMatched.length / job.preferred.length) * 15 : 0
  const rawScore = coverageRatio * 85 + prefBonus

  return {
    matchedSkills,
    missingSkills,
    preferredMatched,
    score: Math.min(100, Math.round(rawScore)),
    coverageRatio,
  }
}
