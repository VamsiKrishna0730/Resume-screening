import { NextResponse } from 'next/server'
import { candidates as seedCandidates, jobs as seedJobs } from '@/lib/demo-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const candidateId = body.candidateId || 'C-1001'
    const jobId = body.jobId || 'JOB-001'

    const candidate = body.candidate || seedCandidates.find(c => c.id === candidateId) || seedCandidates[0]
    const job = body.job || seedJobs.find(j => j.id === jobId) || seedJobs[0]

    const candidateSkillsLower = (candidate.skills || []).map((s: string) => s.toLowerCase())
    const matched = (job.required || []).filter((r: string) => candidateSkillsLower.includes(r.toLowerCase()))
    const missing = (job.required || []).filter((r: string) => !candidateSkillsLower.includes(r.toLowerCase()))

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      jobId: job.id,
      data: {
        matchedSkills: matched,
        missingSkills: missing,
        coverageRatio: job.required.length > 0 ? (matched.length / job.required.length) : 1,
      },
      provider: process.env.GEMINI_API_KEY ? 'Google Gemini (Server-side)' : 'Deterministic Fallback',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Skill analysis failed' }, { status: 500 })
  }
}
