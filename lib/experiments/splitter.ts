/**
 * PRISM Research Experimentation: Candidate-Aware Disjoint Data Splitter
 * Ensures zero candidate-level or text-level leakage between train, validation, and test sets.
 */

export interface DatasetRecord {
  candidate_id: string
  job_id: string
  resume_text: string
  job_description: string
  ground_truth_match: number
  skills?: string[]
  experience?: number
  education?: string
  projects?: string[]
  recruiter_label?: string
  demographic_attribute?: string
}

export interface SplitResult {
  train: DatasetRecord[]
  val: DatasetRecord[]
  test: DatasetRecord[]
  seed: number
  proportions: { train: number; val: number; test: number }
  leakageFree: boolean
}

/**
 * Deterministic pseudo-random number generator (LCG)
 */
function createDeterministicRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Shuffles an array in-place deterministically using Fisher-Yates with a fixed seed.
 */
function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const rand = createDeterministicRandom(seed)
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Splits dataset records strictly by candidate_id to prevent train/test applicant overlap.
 */
export function splitDatasetByCandidate(
  records: DatasetRecord[],
  trainRatio = 0.70,
  valRatio = 0.15,
  testRatio = 0.15,
  seed = 42
): SplitResult {
  if (Math.abs(trainRatio + valRatio + testRatio - 1.0) > 1e-4) {
    throw new Error('Split proportions must sum to 1.0')
  }

  // 1. Group unique candidate IDs
  const uniqueCandidateIds = Array.from(new Set(records.map(r => r.candidate_id))).sort()
  const shuffledCandidates = deterministicShuffle(uniqueCandidateIds, seed)

  const nTotal = shuffledCandidates.length
  const nTrain = Math.floor(nTotal * trainRatio)
  const nVal = Math.floor(nTotal * valRatio)

  const trainCandidateSet = new Set(shuffledCandidates.slice(0, nTrain))
  const valCandidateSet = new Set(shuffledCandidates.slice(nTrain, nTrain + nVal))
  const testCandidateSet = new Set(shuffledCandidates.slice(nTrain + nVal))

  // 2. Assign records based on candidate_id
  const train = records.filter(r => trainCandidateSet.has(r.candidate_id))
  const val = records.filter(r => valCandidateSet.has(r.candidate_id))
  const test = records.filter(r => testCandidateSet.has(r.candidate_id))

  // 3. Verify disjointness
  const trainOverlapVal = Array.from(trainCandidateSet).filter(id => valCandidateSet.has(id))
  const trainOverlapTest = Array.from(trainCandidateSet).filter(id => testCandidateSet.has(id))
  const valOverlapTest = Array.from(valCandidateSet).filter(id => testCandidateSet.has(id))

  const leakageFree = trainOverlapVal.length === 0 && trainOverlapTest.length === 0 && valOverlapTest.length === 0

  return {
    train,
    val,
    test,
    seed,
    proportions: { train: trainRatio, val: valRatio, test: testRatio },
    leakageFree,
  }
}
