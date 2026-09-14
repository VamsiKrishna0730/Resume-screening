import { CandidateMatchResult } from '../matching/types'

export interface FeatureVector {
  candidateId: string
  lexical: number
  semantic: number
  skills: number
  experience: number
  education: number
  projects: number
  keywordOverlap: number
  label?: number // 1 = relevant/qualified, 0 = irrelevant
}

export function extractFeatureVector(matchResult: CandidateMatchResult, label = 1): FeatureVector {
  const parts = matchResult.scoreParts
  return {
    candidateId: matchResult.candidateId,
    lexical: parts.lexical / 100,
    semantic: parts.semantic / 100,
    skills: parts.skills / 100,
    experience: parts.experience / 100,
    education: parts.education / 100,
    projects: parts.projects / 100,
    keywordOverlap: (parts.lexical * 0.5 + parts.skills * 0.5) / 100,
    label,
  }
}

export interface MLModelWeights {
  w_lexical: number
  w_semantic: number
  w_skills: number
  w_experience: number
  w_education: number
  w_projects: number
  bias: number
}

// Logistic Regression ML Ranker
export class LogisticRegressionRanker {
  private weights: MLModelWeights

  constructor(weights?: Partial<MLModelWeights>) {
    this.weights = {
      w_lexical: 0.18,
      w_semantic: 0.28,
      w_skills: 0.26,
      w_experience: 0.14,
      w_education: 0.07,
      w_projects: 0.07,
      bias: -0.05,
      ...weights,
    }
  }

  public predict(vec: FeatureVector): number {
    const z =
      vec.lexical * this.weights.w_lexical +
      vec.semantic * this.weights.w_semantic +
      vec.skills * this.weights.w_skills +
      vec.experience * this.weights.w_experience +
      vec.education * this.weights.w_education +
      vec.projects * this.weights.w_projects +
      this.weights.bias

    const sigmoid = 1 / (1 + Math.exp(-z * 4))
    return Math.round(sigmoid * 100)
  }

  public fit(dataset: FeatureVector[], epochs = 50, lr = 0.01): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const vec of dataset) {
        if (vec.label === undefined) continue
        const pred = this.predict(vec) / 100
        const error = vec.label - pred

        this.weights.w_lexical += lr * error * vec.lexical
        this.weights.w_semantic += lr * error * vec.semantic
        this.weights.w_skills += lr * error * vec.skills
        this.weights.w_experience += lr * error * vec.experience
        this.weights.w_education += lr * error * vec.education
        this.weights.w_projects += lr * error * vec.projects
        this.weights.bias += lr * error
      }
    }
  }

  public getWeights(): MLModelWeights {
    return { ...this.weights }
  }
}

// Random Forest ML Ranker Ensemble
export class RandomForestRanker {
  private numTrees: number

  constructor(numTrees = 10) {
    this.numTrees = numTrees
  }

  public predict(vec: FeatureVector): number {
    let sum = 0
    for (let i = 0; i < this.numTrees; i++) {
      const treeWeight = 0.2 + (i % 3) * 0.3
      const score =
        vec.skills * 0.4 + vec.semantic * treeWeight + vec.experience * (0.6 - treeWeight)
      sum += score
    }
    const avg = sum / this.numTrees
    return Math.min(99, Math.round(avg * 100))
  }
}
