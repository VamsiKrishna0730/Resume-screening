import { NextResponse } from 'next/server'

export async function GET() {
  const registeredModels = [
    {
      name: 'Deterministic Baseline',
      type: 'Rule-based / Keyword',
      version: 'v1.0.0',
      status: 'AVAILABLE',
      trainingStatus: 'NOT TRAINED (Deterministic)',
      provider: 'Local Engine',
      evaluationStatus: 'EVALUATED',
    },
    {
      name: 'TF-IDF Lexical Matcher',
      type: 'Information Retrieval',
      version: 'v1.1.0',
      status: 'AVAILABLE',
      trainingStatus: 'NOT TRAINED (Deterministic)',
      provider: 'Local Engine',
      evaluationStatus: 'EVALUATED',
    },
    {
      name: 'Logistic Regression Ranker',
      type: 'Machine Learning',
      version: 'v1.2.0',
      status: 'AVAILABLE',
      trainingStatus: 'TRAINABLE (SGD Binary Cross-Entropy)',
      provider: 'lib/ml/ranker.ts',
      evaluationStatus: 'EVALUATED',
    },
    {
      name: 'Random Forest Ranker',
      type: 'Ensemble ML',
      version: 'v1.2.0',
      status: 'AVAILABLE',
      trainingStatus: 'TRAINABLE (Ensemble Stumps)',
      provider: 'lib/ml/ranker.ts',
      evaluationStatus: 'EVALUATED',
    },
    {
      name: 'Google Gemini Pro / Flash',
      type: 'LLM Reasoning',
      version: 'gemini-1.5',
      status: process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED (Using Fallback)',
      trainingStatus: 'PRETRAINED (External Foundation Model)',
      provider: 'Google AI Studio',
      evaluationStatus: 'AVAILABLE',
    },
    {
      name: 'PRISM Hybrid Adaptive Framework',
      type: 'Multi-Feature XAI',
      version: 'v1.3.2',
      status: 'ACTIVE',
      trainingStatus: 'HYBRID DETERMINISTIC + FEEDBACK QUEUE',
      provider: 'PRISM Core Engine',
      evaluationStatus: 'EVALUATED',
    },
  ]

  return NextResponse.json({ success: true, data: registeredModels })
}
