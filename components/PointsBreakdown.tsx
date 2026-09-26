import { Info } from 'lucide-react'
import { scoringBreakdown } from '@/lib/scoring'
import type { Confidence, Severity } from '@/types'

interface Props {
  severity: Severity | null
  confidence: Confidence | null
}

export default function PointsBreakdown({ severity, confidence }: Props) {
  if (!severity || !confidence) return null
  const { base, multiplier, total } = scoringBreakdown(severity, confidence)

  return (
    <span tabIndex={0} className="group relative inline-flex cursor-help text-slate-500 outline-none">
      <Info size={14} />
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-max max-w-[220px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-normal leading-snug text-slate-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {base} base (severity {severity}) × {multiplier} ({confidence.toLowerCase()} confidence) ={' '}
        {total} pts
      </span>
    </span>
  )
}
