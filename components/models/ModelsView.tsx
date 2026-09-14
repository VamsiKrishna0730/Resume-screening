'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'

function Badge({ children, t = 'neutral' }: { children: React.ReactNode; t?: string }) {
  return <span className={`badge badge-${t}`}>{children}</span>
}

export function ModelsView() {
  const { modelsList, activeModelVersion, setSelectedModelVersion, triggerAdaptiveLearningRun } = useApp()

  const selectedModel = modelsList.find(m => m.version === activeModelVersion) || modelsList[modelsList.length - 1]

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE</p>
          <h1>Model version history</h1>
          <p className="lede">Versioned synthetic checkpoints for research comparison and adaptive learning runs.</p>
        </div>
        <button className="button primary" onClick={triggerAdaptiveLearningRun}>
          <Sparkles size={15} /> Run Adaptive Retraining
        </button>
      </div>

      <div className="model-history">
        {modelsList.map(m => {
          const isSelected = selectedModel.version === m.version
          return (
            <button
              className={`panel model-card ${isSelected ? 'selected' : ''}`}
              key={m.version}
              onClick={() => setSelectedModelVersion(m.version)}
            >
              <div className="model-mark">{m.version}</div>
              <div>
                <h2>{m.label}</h2>
                <p>
                  F1 {m.f1} · NDCG {m.ndcg} · Fairness {m.fairness}
                </p>
              </div>
              <Badge t={m.version === activeModelVersion ? 'teal' : 'neutral'}>
                {m.version === activeModelVersion ? 'Current' : 'Archived'}
              </Badge>
            </button>
          )
        })}
      </div>

      <div className="panel selected-model" style={{ marginTop: '20px' }}>
        <p className="eyebrow">SELECTED MODEL</p>
        <h2>
          {selectedModel.version} · {selectedModel.label}
        </h2>
        <div className="metric-cards">
          <div>
            <small>Accuracy</small>
            <strong>{selectedModel.accuracy}</strong>
          </div>
          <div>
            <small>F1 Score</small>
            <strong>{selectedModel.f1}</strong>
          </div>
          <div>
            <small>Feedback events</small>
            <strong>{selectedModel.feedback}</strong>
          </div>
        </div>
      </div>

      <div className="panel table-panel" style={{ marginTop: '20px' }}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">REGISTRY</p>
            <h2>Registered Algorithmic & AI Models</h2>
          </div>
          <Badge t="teal">6 Models Registered</Badge>
        </div>
        <table>
          <thead>
            <tr>
              <th>Model Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Training Status</th>
              <th>Provider</th>
              <th>Evaluation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Deterministic Baseline</strong></td>
              <td>Rule-based / Keyword</td>
              <td><Badge t="teal">AVAILABLE</Badge></td>
              <td>NOT TRAINED (Deterministic)</td>
              <td>Local Engine</td>
              <td>EVALUATED</td>
            </tr>
            <tr>
              <td><strong>TF-IDF Lexical Matcher</strong></td>
              <td>Information Retrieval</td>
              <td><Badge t="teal">AVAILABLE</Badge></td>
              <td>NOT TRAINED (Deterministic)</td>
              <td>Local Engine</td>
              <td>EVALUATED</td>
            </tr>
            <tr>
              <td><strong>Logistic Regression Ranker</strong></td>
              <td>Machine Learning</td>
              <td><Badge t="teal">AVAILABLE</Badge></td>
              <td>TRAINABLE (SGD Cross-Entropy)</td>
              <td>lib/ml/ranker.ts</td>
              <td>EVALUATED</td>
            </tr>
            <tr>
              <td><strong>Random Forest Ranker</strong></td>
              <td>Ensemble ML</td>
              <td><Badge t="teal">AVAILABLE</Badge></td>
              <td>TRAINABLE (Ensemble Stumps)</td>
              <td>lib/ml/ranker.ts</td>
              <td>EVALUATED</td>
            </tr>
            <tr>
              <td><strong>Google Gemini Pro / Flash</strong></td>
              <td>LLM Reasoning</td>
              <td><Badge t="neutral">CONFIGURED / FALLBACK</Badge></td>
              <td>PRETRAINED (External Foundation)</td>
              <td>Google AI Studio</td>
              <td>AVAILABLE</td>
            </tr>
            <tr>
              <td><strong>PRISM Hybrid Adaptive</strong></td>
              <td>Multi-Feature XAI</td>
              <td><Badge t="teal">ACTIVE</Badge></td>
              <td>HYBRID + FEEDBACK QUEUE</td>
              <td>PRISM Core Engine</td>
              <td>EVALUATED</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
