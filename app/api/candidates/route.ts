import { NextResponse } from 'next/server'
import { candidates as seedCandidates } from '@/lib/demo-data'

export async function GET() {
  return NextResponse.json({ success: true, data: seedCandidates })
}
