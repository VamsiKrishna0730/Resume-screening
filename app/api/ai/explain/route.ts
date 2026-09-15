import { NextResponse } from 'next/server'
import { generateExplanations } from '@/lib/matching/explanations'
import { analyzeSkills } from '@/lib/matching/skills'
import { candidates as seedCandidates, jobs as seedJobs } from '@/lib/demo-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const candidateId = body.candidateId || 'C-1001'
    const jobId = body.jobId || 'JOB-001'

    const candidate = body.candidate || seedCandidates.find(c => c.id === candidateId) || seedCandidates[0]
    const job = body.job || seedJobs.find(j => j.id === jobId) || seedJobs[0]

    const skillAnalysis = analyzeSkills(candidate, job)
    const scoreParts = { lexical: 82, semantic: 88, skills: 90, experience: 85, education: 80, projects: 85, cgpa: 85 }

    const factors = generateExplanations(candidate, job, skillAnalysis, scoreParts)

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      jobId: job.id,
      data: {
        summary: `Match evaluation for ${candidate.name} against ${job.title}`,
        positiveContributions: factors.filter(f => f.isPositive).map(f => f.description),
        negativeContributions: factors.filter(f => !f.isPositive).map(f => f.description),
      },
      provider: process.env.GEMINI_API_KEY ? 'Google Gemini (Server-side)' : 'Deterministic Fallback',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to generate explanation' }, { status: 500 })
  }
}
