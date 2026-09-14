import { NextResponse } from 'next/server'
import { jobs as seedJobs } from '@/lib/demo-data'

export async function GET() {
  return NextResponse.json({ success: true, data: seedJobs })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newJob = {
      id: `JOB-00${seedJobs.length + 1}`,
      title: body.title || 'New Job Role',
      department: body.department || 'Engineering',
      required: body.required || ['Python', 'SQL'],
      preferred: body.preferred || ['AWS'],
      education: body.education || 'BSc or equivalent',
      experience: body.experience || '3+ years',
      candidates: 0,
      description: body.description || 'Job role description.',
    }
    return NextResponse.json({ success: true, data: newJob })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create job' }, { status: 500 })
  }
}
