import type { Confidence, Severity } from '@/types'

/** Mirrors PROCESS_PENDING_SUBMISSIONS()'s scoring formula, for display only. */
export function baseForSeverity(severity: Severity): number {
  if (severity <= 2) return 50
  if (severity === 3) return 100
  return 200
}

export function multiplierForConfidence(confidence: Confidence): number {
  return confidence === 'HIGH' ? 1.5 : 1
}

export interface ScoringBreakdown {
  base: number
  multiplier: number
  total: number
}

export function scoringBreakdown(severity: Severity, confidence: Confidence): ScoringBreakdown {
  const base = baseForSeverity(severity)
  const multiplier = multiplierForConfidence(confidence)
  return { base, multiplier, total: Math.round(base * multiplier) }
}

/**
 * Spec §3 "Detecting the Exploration Bonus in Frontend": a submission earned the +75
 * new-territory bonus if its actual points exceed what the severity/confidence formula alone
 * would award. Only meaningful once severity/confidence are known (i.e. STATUS === 'PROCESSED').
 */
export function didGetExplorationBonus(
  pointsAwarded: number,
  severity: Severity | null,
  confidence: Confidence | null,
): boolean {
  if (!severity || !confidence) return false
  const { total } = scoringBreakdown(severity, confidence)
  return pointsAwarded > total
}
