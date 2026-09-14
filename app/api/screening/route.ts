import { NextResponse } from 'next/server'
import { scoreCandidate, DEFAULT_WEIGHTS } from '@/lib/matching/score'
import { candidates as seedCandidates, jobs as seedJobs } from '@/lib/demo-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const jobId = body.jobId || 'JOB-001'
    const weights = body.weights || DEFAULT_WEIGHTS

    const targetJob = seedJobs.find(j => j.id === jobId) || seedJobs[0]
    const ranked = seedCandidates
      .map(c => {
        const match = scoreCandidate(c, targetJob, weights)
        return {
          candidateId: c.id,
          name: c.name,
          score: match.totalScore,
          confidence: match.confidence,
          scoreParts: match.scoreParts,
        }
      })
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({
      success: true,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      totalCandidates: ranked.length,
      data: ranked,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Screening computation failed' },
      { status: 500 }
    )
  }
}
