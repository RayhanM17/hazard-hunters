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
