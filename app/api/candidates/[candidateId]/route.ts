import { NextResponse } from 'next/server'
import { candidates as seedCandidates } from '@/lib/demo-data'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params
  const candidate = seedCandidates.find(c => c.id.toLowerCase() === candidateId.toLowerCase())
  if (!candidate) {
    return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: candidate })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params
  const body = await request.json()
  return NextResponse.json({
    success: true,
    data: { id: candidateId, updatedStatus: body.status || 'Recommended' },
  })
}
