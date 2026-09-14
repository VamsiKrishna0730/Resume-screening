import { NextResponse } from 'next/server'

// In-memory feedback store for session
let feedbackRecords: Array<{
  id: string
  candidateId: string
  jobId: string
  action: string
  previousScore: number
  previousRank: number
  recruiter: string
  timestamp: string
  status: string
}> = [
  {
    id: 'FB-001',
    candidateId: 'C-1001',
    jobId: 'JOB-001',
    action: 'Shortlist',
    previousScore: 92,
    previousRank: 1,
    recruiter: 'Alex Morgan',
    timestamp: new Date().toISOString(),
    status: 'Recorded · Pending Adaptation',
  },
  {
    id: 'FB-002',
    candidateId: 'C-1002',
    jobId: 'JOB-001',
    action: 'Advance',
    previousScore: 89,
    previousRank: 2,
    recruiter: 'Alex Morgan',
    timestamp: new Date().toISOString(),
    status: 'Recorded · Pending Adaptation',
  },
]

export async function GET() {
  return NextResponse.json({ success: true, data: feedbackRecords })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newRecord = {
      id: `FB-00${feedbackRecords.length + 1}`,
      candidateId: body.candidateId || 'C-1001',
      jobId: body.jobId || 'JOB-001',
      action: body.action || 'Shortlist',
      previousScore: body.previousScore || 85,
      previousRank: body.previousRank || 1,
      recruiter: body.recruiter || 'Alex Morgan',
      timestamp: new Date().toISOString(),
      status: 'Recorded · Pending Adaptation',
    }
    feedbackRecords.unshift(newRecord)
    return NextResponse.json({ success: true, data: newRecord })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to record feedback' }, { status: 500 })
  }
}
