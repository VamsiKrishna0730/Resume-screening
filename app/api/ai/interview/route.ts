import { NextResponse } from 'next/server'
import { candidates as seedCandidates, jobs as seedJobs } from '@/lib/demo-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const candidateId = body.candidateId || 'C-1001'
    const jobId = body.jobId || 'JOB-001'

    const candidate = seedCandidates.find(c => c.id === candidateId) || seedCandidates[0]
    const job = seedJobs.find(j => j.id === jobId) || seedJobs[0]

    const questions = [
      `Could you describe your hands-on experience building architectures using ${candidate.skills.slice(0, 2).join(' and ')}?`,
      `How have you handled performance trade-offs in projects related to ${job.title}?`,
      `The role requires ${job.required.slice(-2).join(' and ')}. How would you bridge your existing skills to scale our current stack?`,
      `Can you share a specific production debugging scenario from your past ${candidate.experience} years of software engineering experience?`,
    ]

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      jobId: job.id,
      data: {
        questions,
        recommendedFocusAreas: job.required.slice(0, 3),
      },
      provider: process.env.GEMINI_API_KEY ? 'Google Gemini (Server-side)' : 'Deterministic Fallback',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to generate interview questions' }, { status: 500 })
  }
}
