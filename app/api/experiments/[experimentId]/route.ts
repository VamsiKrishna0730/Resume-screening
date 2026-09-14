import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ experimentId: string }> }
) {
  const { experimentId } = await params
  return NextResponse.json({
    success: true,
    data: {
      experimentId,
      name: 'Full PRISM Hybrid Model Evaluation',
      dataset: 'Synthetic Research Benchmark v1.3',
      metrics: {
        accuracy: 0.91,
        precision: 0.88,
        recall: 0.86,
        f1: 0.87,
        ndcg10: 0.84,
      },
      status: 'COMPLETED',
      reproducibleSeed: 42,
    },
  })
}
