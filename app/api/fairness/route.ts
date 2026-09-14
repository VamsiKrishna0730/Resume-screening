import { NextResponse } from 'next/server'
import { auditFairness } from '@/lib/fairness/engine'
import { candidates as seedCandidates } from '@/lib/demo-data'

export async function GET() {
  const statuses = Object.fromEntries(seedCandidates.map(c => [c.id, c.status]))
  const report = auditFairness(seedCandidates, statuses)
  return NextResponse.json({
    success: true,
    data: report,
    mode: 'SYNTHETIC AUDIT',
    disclaimer: 'Evaluated on synthetic demographic cohorts (Group A, Group B, Group C) for research audit only.',
  })
}

export async function POST(request: Request) {
  try {
    const statuses = Object.fromEntries(seedCandidates.map(c => [c.id, c.status]))
    const report = auditFairness(seedCandidates, statuses)
    return NextResponse.json({
      success: true,
      data: report,
      mode: 'SYNTHETIC AUDIT',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to compute fairness audit' }, { status: 500 })
  }
}
