import { NextResponse } from 'next/server'
import { jobs as seedJobs } from '@/lib/demo-data'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  const job = seedJobs.find(j => j.id.toLowerCase() === jobId.toLowerCase())
  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: job })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  return NextResponse.json({ success: true, message: `Job ${jobId} archived/deleted` })
}
