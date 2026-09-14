import { Candidate, Job } from './types'

function tokenize(text: string): Set<string> {
  const stopWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'with', 'for', 'of', 'to', 'at', 'by', 'is', 'are', 'built', 'production', 'strong', 'experience'])
  const words = text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, ' ').split(/\s+/)
  return new Set(words.filter(w => w.length > 1 && !stopWords.has(w)))
}

export function calculateLexicalScore(candidate: Candidate, job: Job): number {
  const candText = `${candidate.summary} ${candidate.skills.join(' ')} ${candidate.education}`
  const jobText = `${job.title} ${job.department} ${job.required.join(' ')} ${job.preferred.join(' ')} ${job.description || ''}`

  const candTokens = tokenize(candText)
  const jobTokens = tokenize(jobText)

  if (jobTokens.size === 0) return 75

  let intersection = 0
  jobTokens.forEach(token => {
    if (candTokens.has(token)) {
      intersection++
    }
  })

  const jaccard = intersection / (candTokens.size + jobTokens.size - intersection)
  const overlapRatio = intersection / jobTokens.size

  const combined = (jaccard * 0.4 + overlapRatio * 0.6) * 100
  const normalized = Math.min(98, Math.max(50, Math.round(combined * 1.35 + 45)))

  return normalized
}
