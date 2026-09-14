/**
 * PRISM CGPA Normalization & Scoring Module
 * Provides robust validation, scale normalization, soft scoring, and hard requirement evaluation.
 */

export type CGPAScreeningMode = 'SOFT' | 'HARD'
export type CGPAScreeningStatus = 'PASS' | 'FAIL' | 'CGPA NOT FOUND' | 'INVALID CGPA'

export interface CGPAValidationResult {
  isValid: boolean
  error?: string
  normalizedValue?: number
}

export interface CGPAMatchResult {
  candidateCGPA?: number
  candidateScale?: number
  normalizedCandidateCGPA?: number
  requiredCGPA?: number
  requiredScale?: number
  normalizedRequiredCGPA?: number
  score: number // in [0.0, 1.0]
  isEligible: boolean
  status: 'Meets Requirement' | 'Below Requirement' | 'Not Provided' | 'Invalid CGPA'
  screeningStatus: CGPAScreeningStatus
  screeningReason: string
  mode: CGPAScreeningMode
  explanation: string
}

/**
 * Validates a CGPA value and scale.
 */
export function validateCGPA(value?: number | null, scale: number = 10.0): CGPAValidationResult {
  if (value === undefined || value === null || isNaN(value)) {
    return { isValid: false, error: 'CGPA not provided' }
  }
  if (scale <= 0) {
    return { isValid: false, error: 'Scale must be greater than zero' }
  }
  if (value < 0) {
    return { isValid: false, error: 'CGPA cannot be negative' }
  }
  if (value > scale) {
    return { isValid: false, error: `CGPA (${value}) exceeds declared scale (${scale})` }
  }
  return { isValid: true, normalizedValue: value / scale }
}

/**
 * Normalizes a CGPA value to [0.0, 1.0].
 */
export function normalizeCGPA(value: number, sourceScale: number): number {
  const validation = validateCGPA(value, sourceScale)
  if (!validation.isValid || validation.normalizedValue === undefined) {
    throw new Error(validation.error || 'Invalid CGPA for normalization')
  }
  return validation.normalizedValue
}

/**
 * Evaluates candidate CGPA against job requirement.
 * 
 * Logic:
 * - If job does not specify minimum CGPA: neutral score 1.0, isEligible = true.
 * - If candidate did not provide CGPA:
 *   - In SOFT mode: neutral score (0.75 or 1.0 depending on policy, default 0.75 neutral), isEligible = true.
 *   - In HARD mode: isEligible = false if hard requirement is strictly enforced, or flagged as Not Provided.
 * - If candidate meets/exceeds requirement (normCand >= normReq): score = 1.0, isEligible = true.
 * - If candidate is below requirement (normCand < normReq):
 *   - In SOFT mode: score = max(0, min(1, normCand / normReq)), isEligible = true.
 *   - In HARD mode: score = max(0, min(1, normCand / normReq)), isEligible = false.
 */
export function evaluateCGPA(
  candidateCGPA?: number,
  candidateScale: number = 10.0,
  requiredMinimum?: number,
  requiredScale: number = 10.0,
  mode: CGPAScreeningMode = 'SOFT'
): CGPAMatchResult {
  // Case 1: Job does not specify a CGPA requirement
  if (requiredMinimum === undefined || requiredMinimum === null || requiredMinimum <= 0) {
    let normCand: number | undefined
    let candValid = false
    if (candidateCGPA !== undefined && candidateCGPA !== null) {
      const v = validateCGPA(candidateCGPA, candidateScale)
      if (v.isValid) {
        normCand = v.normalizedValue
        candValid = true
      }
    }
    return {
      candidateCGPA,
      candidateScale,
      normalizedCandidateCGPA: normCand,
      score: 1.0,
      isEligible: true,
      status: candidateCGPA !== undefined ? (candValid ? 'Meets Requirement' : 'Invalid CGPA') : 'Not Provided',
      screeningStatus: candidateCGPA !== undefined ? (candValid ? 'PASS' : 'INVALID CGPA') : 'CGPA NOT FOUND',
      screeningReason: candidateCGPA !== undefined
        ? (candValid ? 'No minimum CGPA required. Candidate CGPA recorded.' : 'Candidate provided invalid CGPA.')
        : 'No minimum CGPA requirement configured for this position.',
      mode,
      explanation: 'No minimum CGPA required for this position.'
    }
  }

  const reqVal = validateCGPA(requiredMinimum, requiredScale)
  if (!reqVal.isValid || reqVal.normalizedValue === undefined) {
    return {
      candidateCGPA,
      candidateScale,
      score: 1.0,
      isEligible: true,
      status: 'Meets Requirement',
      screeningStatus: 'PASS',
      screeningReason: `Invalid job requirement scale configuration: ${reqVal.error}`,
      mode,
      explanation: `Invalid job requirement scale configuration: ${reqVal.error}`
    }
  }
  const normReq = reqVal.normalizedValue

  // Case 2: Candidate did not provide CGPA
  if (candidateCGPA === undefined || candidateCGPA === null || isNaN(candidateCGPA)) {
    return {
      requiredCGPA: requiredMinimum,
      requiredScale,
      normalizedRequiredCGPA: normReq,
      score: mode === 'HARD' ? 0.0 : 0.75, // Neutral score for soft evaluation
      isEligible: mode !== 'HARD',
      status: 'Not Provided',
      screeningStatus: 'CGPA NOT FOUND',
      screeningReason: `CGPA was not found on candidate resume; minimum required is ${requiredMinimum} / ${requiredScale}.`,
      mode,
      explanation: mode === 'HARD'
        ? `Minimum CGPA ${requiredMinimum}/${requiredScale} is strictly required, but candidate did not provide CGPA.`
        : `CGPA was not provided; evaluated with neutral weighting without penalizing.`
    }
  }

  // Case 3: Validate candidate CGPA
  const candVal = validateCGPA(candidateCGPA, candidateScale)
  if (!candVal.isValid || candVal.normalizedValue === undefined) {
    return {
      candidateCGPA,
      candidateScale,
      requiredCGPA: requiredMinimum,
      requiredScale,
      normalizedRequiredCGPA: normReq,
      score: 0.0,
      isEligible: false,
      status: 'Invalid CGPA',
      screeningStatus: 'INVALID CGPA',
      screeningReason: `Candidate provided invalid CGPA (${candidateCGPA}): ${candVal.error}`,
      mode,
      explanation: `Candidate provided invalid CGPA: ${candVal.error}`
    }
  }

  const normCand = candVal.normalizedValue

  // Case 4: Candidate meets or exceeds minimum (normCand >= normReq)
  // Float tolerance threshold (e.g. 1e-9) to guarantee exact 7.0/10 vs 7.0/10 or 3.2/4 vs 7.0/10 is PASS
  if (normCand >= (normReq - 1e-9)) {
    return {
      candidateCGPA,
      candidateScale,
      normalizedCandidateCGPA: normCand,
      requiredCGPA: requiredMinimum,
      requiredScale,
      normalizedRequiredCGPA: normReq,
      score: 1.0,
      isEligible: true,
      status: 'Meets Requirement',
      screeningStatus: 'PASS',
      screeningReason: `Candidate CGPA ${candidateCGPA} / ${candidateScale} meets or exceeds required minimum of ${requiredMinimum} / ${requiredScale}.`,
      mode,
      explanation: `Candidate CGPA (${candidateCGPA}/${candidateScale}) meets or exceeds required minimum (${requiredMinimum}/${requiredScale}).`
    }
  }

  // Case 5: Candidate below minimum (normCand < normReq)
  const boundedScore = Math.max(0.0, Math.min(1.0, normCand / normReq))
  const isEligible = mode === 'SOFT'

  return {
    candidateCGPA,
    candidateScale,
    normalizedCandidateCGPA: normCand,
    requiredCGPA: requiredMinimum,
    requiredScale,
    normalizedRequiredCGPA: normReq,
    score: parseFloat(boundedScore.toFixed(4)),
    isEligible,
    status: 'Below Requirement',
    screeningStatus: 'FAIL',
    screeningReason: `Candidate CGPA ${candidateCGPA} / ${candidateScale} is below the required minimum of ${requiredMinimum} / ${requiredScale}.`,
    mode,
    explanation: mode === 'HARD'
      ? `Candidate CGPA (${candidateCGPA}/${candidateScale}) is below required minimum (${requiredMinimum}/${requiredScale}). Hard filter applied: NOT ELIGIBLE.`
      : `Candidate CGPA (${candidateCGPA}/${candidateScale}) is below target (${requiredMinimum}/${requiredScale}). Scaled contribution: ${Math.round(boundedScore * 100)}%.`
  }
}

/**
 * Screen candidate CGPA convenience wrapper accepting either raw values or Candidate/Job objects.
 */
export function screenCandidateCGPA(
  candidateCGPAOrCand?: any,
  candidateScaleOrJob?: any,
  requiredMinimum?: number,
  requiredScale: number = 10.0,
  mode: CGPAScreeningMode = 'HARD'
): { pass: boolean; reason: string; status: CGPAScreeningStatus } {
  if (candidateCGPAOrCand && typeof candidateCGPAOrCand === 'object' && 'cgpa' in candidateCGPAOrCand) {
    const cand = candidateCGPAOrCand
    const job = candidateScaleOrJob || {}
    const isScreeningActive = job.enableCGPAScreening !== false && job.minimumCGPA !== undefined && job.minimumCGPA > 0
    const res = evaluateCGPA(
      cand.cgpa,
      cand.cgpaScale || 10.0,
      isScreeningActive ? job.minimumCGPA : undefined,
      job.cgpaScale || 10.0,
      job.cgpaMode || 'HARD'
    )
    return {
      pass: res.isEligible,
      reason: res.screeningReason,
      status: res.screeningStatus
    }
  }

  const res = evaluateCGPA(
    candidateCGPAOrCand,
    candidateScaleOrJob ?? 10.0,
    requiredMinimum,
    requiredScale,
    mode
  )
  return {
    pass: res.isEligible,
    reason: res.screeningReason,
    status: res.screeningStatus
  }
}

