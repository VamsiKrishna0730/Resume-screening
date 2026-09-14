import { Candidate, Job } from './types'

const CONCEPT_DOMAINS: Record<string, string[]> = {
  ai: ['python', 'pytorch', 'tensorflow', 'nlp', 'transformers', 'ml', 'machine learning', 'scikit-learn', 'deep learning', 'computer vision'],
  data: ['python', 'sql', 'statistics', 'spark', 'tableau', 'pandas', 'experimentation', 'data science'],
  frontend: ['react', 'typescript', 'javascript', 'css', 'html', 'testing', 'accessibility', 'frontend'],
  backend: ['node.js', 'postgres', 'postgresql', 'apis', 'docker', 'cloud', 'aws', 'kubernetes', 'c++'],
}

export function calculateSemanticScore(candidate: Candidate, job: Job): number {
  const jobTitleLower = job.title.toLowerCase()
  let targetDomain = 'ai'

  if (jobTitleLower.includes('frontend') || jobTitleLower.includes('developer')) {
    targetDomain = 'frontend'
  } else if (jobTitleLower.includes('backend') || jobTitleLower.includes('platform')) {
    targetDomain = 'backend'
  } else if (jobTitleLower.includes('data') || jobTitleLower.includes('statistician')) {
    targetDomain = 'data'
  }

  const domainKeywords = CONCEPT_DOMAINS[targetDomain] || CONCEPT_DOMAINS.ai
  const candSkillsNorm = candidate.skills.map(s => s.toLowerCase())
  const candTextLower = candidate.summary.toLowerCase()

  let matches = 0
  domainKeywords.forEach(kw => {
    if (candSkillsNorm.some(s => s.includes(kw)) || candTextLower.includes(kw)) {
      matches++
    }
  })

  const baseRatio = matches / domainKeywords.length
  const semanticScore = Math.round(Math.min(96, Math.max(52, baseRatio * 55 + 45)))

  return semanticScore
}
