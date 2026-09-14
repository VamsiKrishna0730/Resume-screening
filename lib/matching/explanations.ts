import { Candidate, Job, ExplanationFactor, SkillAnalysis, CGPAAssessment } from './types'

export function generateExplanations(
  candidate: Candidate,
  job: Job,
  skillAnalysis: SkillAnalysis,
  scores: { lexical: number; semantic: number; skills: number; experience: number; education: number; projects: number; cgpa: number },
  cgpaAssessment?: CGPAAssessment
): ExplanationFactor[] {
  const factors: ExplanationFactor[] = []

  if (skillAnalysis.matchedSkills.length > 0) {
    const topSkills = skillAnalysis.matchedSkills.slice(0, 3).join(', ')
    factors.push({
      feature: `Required skill coverage (${skillAnalysis.matchedSkills.length}/${job.required.length})`,
      contribution: Math.round(skillAnalysis.coverageRatio * 25),
      isPositive: true,
      description: `Matched core skills: ${topSkills}`,
    })
  }

  if (scores.semantic >= 85) {
    factors.push({
      feature: 'Strong semantic domain alignment',
      contribution: Math.round((scores.semantic / 100) * 20),
      isPositive: true,
      description: 'Candidate research and project portfolio closely align with role requirements.',
    })
  }

  if (candidate.experience >= 3) {
    factors.push({
      feature: `Professional experience (${candidate.experience} years)`,
      contribution: Math.min(18, Math.round(candidate.experience * 3)),
      isPositive: true,
      description: 'Meets or exceeds minimum required domain experience.',
    })
  } else if (candidate.experience < 2) {
    factors.push({
      feature: `Junior experience level (${candidate.experience} years)`,
      contribution: -8,
      isPositive: false,
      description: 'Experience is below target threshold for senior role responsibilities.',
    })
  }

  if (skillAnalysis.missingSkills.length > 0) {
    const missing = skillAnalysis.missingSkills.slice(0, 2).join(' & ')
    factors.push({
      feature: `Skill gap detected: ${missing}`,
      contribution: -(skillAnalysis.missingSkills.length * 5),
      isPositive: false,
      description: `Skill gap identified against active job specification.`,
    })
  } else if (job.preferred.length > 0) {
    const prefMissing = job.preferred.filter(p => !skillAnalysis.preferredMatched.includes(p))
    if (prefMissing.length > 0) {
      factors.push({
        feature: `Preferred skill gap: ${prefMissing[0]}`,
        contribution: -4,
        isPositive: false,
        description: `Does not explicitly list preferred technology ${prefMissing[0]}.`,
      })
    }
  }

  // CGPA explanation factor
  if (cgpaAssessment) {
    if (cgpaAssessment.status === 'Meets Requirement') {
      const contrib = Math.round(cgpaAssessment.score * 10)
      factors.push({
        feature: `Academic Performance (CGPA ${cgpaAssessment.candidateCGPA !== undefined ? cgpaAssessment.candidateCGPA + '/' + cgpaAssessment.candidateScale : 'Verified'})`,
        contribution: contrib > 0 ? contrib : 8,
        isPositive: true,
        description: cgpaAssessment.explanation,
      })
    } else if (cgpaAssessment.status === 'Below Requirement') {
      const shortfall = Math.round((1.0 - cgpaAssessment.score) * 10)
      factors.push({
        feature: `CGPA below target (${cgpaAssessment.candidateCGPA}/${cgpaAssessment.candidateScale} vs min ${cgpaAssessment.requiredCGPA}/${cgpaAssessment.requiredScale})`,
        contribution: -Math.max(4, shortfall),
        isPositive: false,
        description: cgpaAssessment.explanation,
      })
    } else if (cgpaAssessment.status === 'Not Provided') {
      if (job.minimumCGPA) {
        factors.push({
          feature: 'CGPA not provided',
          contribution: cgpaAssessment.mode === 'HARD' ? -15 : 0,
          isPositive: cgpaAssessment.mode !== 'HARD',
          description: cgpaAssessment.explanation,
        })
      }
    }
  }

  return factors
}
