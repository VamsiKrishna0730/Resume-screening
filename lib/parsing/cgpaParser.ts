/**
 * Resume CGPA Parsing & Extraction Module
 * Extracts CGPA / GPA patterns with scale detection and false-positive rejection.
 */

export interface ParsedCGPA {
  value: number
  scale: number
  confidence: number
  sourceText: string
}

/**
 * Extracts CGPA or GPA from unstructured text.
 * Avoids false matches such as years (2024), percentages (95%), compensation (8.5 LPA), or experience (10 years).
 */
export function extractCGPAFromText(text: string): ParsedCGPA | null {
  if (!text) return null

  // Pattern 1: Explicit CGPA/GPA with optional slash and scale (e.g. "CGPA: 8.5/10", "GPA 3.6/4.0", "C.G.P.A - 9.1")
  const explicitPattern = /\b(?:c\.?g\.?p\.?a\.?|g\.?p\.?a\.?)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:\/\s*([0-9]+(?:\.[0-9]+)?))?/i
  const match = text.match(explicitPattern)

  if (match) {
    const rawVal = parseFloat(match[1])
    let rawScale = match[2] ? parseFloat(match[2]) : undefined

    // Filter out unlikely values like years (e.g. 2020)
    if (isNaN(rawVal) || rawVal < 0 || rawVal > 100) {
      return null
    }

    // Infer scale if not explicitly given
    if (!rawScale) {
      if (rawVal <= 4.0) {
        rawScale = 4.0
      } else if (rawVal <= 5.0) {
        rawScale = 5.0
      } else if (rawVal <= 10.0) {
        rawScale = 10.0
      } else if (rawVal <= 100.0) {
        // Percentage treated as 100 scale
        rawScale = 100.0
      } else {
        return null
      }
    }

    // Sanity check: value cannot exceed scale
    if (rawVal > rawScale) {
      return null
    }

    // False positive rejection: check surrounding tokens for LPA, years, or %
    const index = match.index || 0
    const surrounding = text.slice(Math.max(0, index - 20), Math.min(text.length, index + match[0].length + 20)).toLowerCase()
    if (surrounding.includes('lpa') || surrounding.includes('ctc') || surrounding.includes('salary') || surrounding.includes('years of')) {
      return null
    }

    return {
      value: rawVal,
      scale: rawScale,
      confidence: match[2] ? 0.95 : 0.85,
      sourceText: match[0].trim()
    }
  }

  // Pattern 2: "Score: 8.5/10" or "Academic Score: 3.8/4.0"
  const academicPattern = /\b(?:academic\s+score|aggregate)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*([0-9]+(?:\.[0-9]+)?)/i
  const acadMatch = text.match(academicPattern)
  if (acadMatch) {
    const rawVal = parseFloat(acadMatch[1])
    const rawScale = parseFloat(acadMatch[2])
    if (!isNaN(rawVal) && !isNaN(rawScale) && rawScale > 0 && rawVal <= rawScale) {
      return {
        value: rawVal,
        scale: rawScale,
        confidence: 0.80,
        sourceText: acadMatch[0].trim()
      }
    }
  }

  return null
}
