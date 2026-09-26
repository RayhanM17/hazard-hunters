import { getTier } from '@/lib/medals'
import type { MedalTier } from '@/types'

interface Props {
  percentage: number
  nextThreshold: number
  tier: MedalTier
}

export default function ProgressBar({ percentage, nextThreshold, tier }: Props) {
  const meta    = getTier(tier)
  const isMax   = tier === 'Apex Driver'
  const clamped = Math.min(100, Math.max(0, percentage))

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-400">
        <span>{tier}</span>
        {isMax
          ? <span>Max tier reached 👑</span>
          : <span>{nextThreshold.toLocaleString()} pts to next tier</span>}
      </div>
      <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: meta?.color ?? '#64748B' }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">{clamped.toFixed(1)}%</p>
    </div>
  )
}
