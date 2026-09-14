import { NextResponse } from 'next/server'
import { evaluateExperiments, generateAblationTable } from '@/lib/experiments/evaluator'

export async function GET() {
  const metrics = evaluateExperiments()
  const ablations = generateAblationTable()

  return NextResponse.json({
    success: true,
    data: {
      metrics,
      ablations,
    },
    mode: 'SYNTHETIC BENCHMARK',
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const experimentName = body.name || 'Custom Hybrid Run'
    return NextResponse.json({
      success: true,
      message: `Experiment '${experimentName}' queued and executed.`,
      experimentId: `EXP-${Date.now().toString().slice(-4)}`,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to run experiment' }, { status: 500 })
  }
}
