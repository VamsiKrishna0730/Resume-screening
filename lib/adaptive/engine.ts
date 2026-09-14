export interface ModelVersion {
  version: string
  label: string
  accuracy: number
  f1: number
  ndcg: number
  fairness: number
  feedback: number
  timestamp?: string
}

export const INITIAL_MODELS: ModelVersion[] = [
  { version: 'v1.0.0', label: 'Baseline', accuracy: 0.71, f1: 0.68, ndcg: 0.64, fairness: 0.82, feedback: 0 },
  { version: 'v1.1.0', label: 'Semantic Matching', accuracy: 0.77, f1: 0.74, ndcg: 0.72, fairness: 0.81, feedback: 4 },
  { version: 'v1.2.0', label: 'Hybrid Features', accuracy: 0.82, f1: 0.79, ndcg: 0.78, fairness: 0.84, feedback: 11 },
  { version: 'v1.3.0', label: 'Fairness + XAI', accuracy: 0.83, f1: 0.80, ndcg: 0.80, fairness: 0.91, feedback: 18 },
  { version: 'v1.3.2', label: 'Feedback Simulation', accuracy: 0.85, f1: 0.83, ndcg: 0.84, fairness: 0.92, feedback: 24 },
]

export function createAdaptedModelVersion(currentModels: ModelVersion[], feedbackCount: number): ModelVersion[] {
  const latest = currentModels[currentModels.length - 1]
  const versionParts = latest.version.replace('v', '').split('.').map(Number)
  const newPatch = versionParts[2] + 1
  const newVersion = `v${versionParts[0]}.${versionParts[1]}.${newPatch}`

  const newModel: ModelVersion = {
    version: newVersion,
    label: `Adaptive Checkpoint (${feedbackCount} events)`,
    accuracy: Math.min(0.96, Math.round((latest.accuracy + 0.01) * 100) / 100),
    f1: Math.min(0.94, Math.round((latest.f1 + 0.012) * 100) / 100),
    ndcg: Math.min(0.95, Math.round((latest.ndcg + 0.015) * 100) / 100),
    fairness: Math.min(0.96, latest.fairness),
    feedback: feedbackCount,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }

  return [...currentModels, newModel]
}
