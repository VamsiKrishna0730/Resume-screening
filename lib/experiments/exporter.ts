import { ExperimentMetric, AblationRow } from './evaluator'
import { FairnessReport } from '../fairness/engine'
import { ModelVersion } from '../adaptive/engine'

export function exportModelComparisonCSV(experiments: ExperimentMetric[]): string {
  const headers = ['Model', 'Accuracy', 'Precision', 'Recall', 'F1', 'NDCG@10']
  const rows = experiments.map(e => [
    `"${e.name}"`,
    e.accuracy.toFixed(2),
    e.precision.toFixed(2),
    e.recall.toFixed(2),
    e.f1.toFixed(2),
    e.ndcg.toFixed(2),
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function exportAblationCSV(ablations: AblationRow[]): string {
  const headers = ['Configuration', 'Semantic', 'Structured', 'XAI', 'Fairness', 'Feedback', 'F1', 'NDCG']
  const rows = ablations.map(a => [
    `"${a.configuration}"`,
    a.semantic,
    a.structured,
    a.xai,
    a.fairness,
    a.feedback,
    a.f1,
    a.ndcg,
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function exportFairnessCSV(report: FairnessReport): string {
  const headers = ['Metric', 'BeforeMitigation', 'AfterMitigation', 'Threshold', 'Status']
  const rows = report.metrics.map(m => [
    `"${m.metricName}"`,
    m.beforeValue.toFixed(2),
    m.afterValue.toFixed(2),
    m.threshold.toFixed(2),
    m.status,
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function exportFeedbackHistoryCSV(models: ModelVersion[]): string {
  const headers = ['Version', 'Label', 'Accuracy', 'F1', 'NDCG', 'Fairness', 'FeedbackEvents']
  const rows = models.map(m => [
    m.version,
    `"${m.label}"`,
    m.accuracy.toFixed(2),
    m.f1.toFixed(2),
    m.ndcg.toFixed(2),
    m.fairness.toFixed(2),
    m.feedback,
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function generateExperimentSummaryJSON(
  experiments: ExperimentMetric[],
  ablations: AblationRow[],
  fairness: FairnessReport,
  models: ModelVersion[]
): string {
  const summary = {
    metadata: {
      researchTitle: 'A Fair, Explainable, and Feedback-Adaptive AI Framework for Resume Screening and Candidate Matching',
      timestamp: new Date().toISOString(),
      evaluationFramework: 'PRISM Research Benchmark v1.3.2',
      reproducibleSeed: 42,
    },
    metrics: {
      modelComparison: experiments,
      ablationStudy: ablations,
      fairnessAudit: fairness,
      checkpointHistory: models,
    },
  }
  return JSON.stringify(summary, null, 2)
}
