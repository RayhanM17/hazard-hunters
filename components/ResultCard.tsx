import type { UploadResult } from '@/types'
import MedalBadge from './MedalBadge'

interface Props {
  result: UploadResult
}

const HAZARD_LABELS: Record<string, string> = {
  POTHOLE:      '🕳️ Pothole',
  FADED_LINE:   '🛣️ Faded Line',
  CONSTRUCTION: '🚧 Construction',
  NONE:         '✅ No Hazard',
}

export default function ResultCard({ result }: Props) {
  const { submission, user } = result
  const hazard  = submission.hazardType ?? 'NONE'
  const label   = HAZARD_LABELS[hazard] ?? hazard
  const earnedPts = hazard !== 'NONE' ? 100 : 0

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3">
      {/* Tier-up banner */}
      {user.tierChanged && (
        <div className="text-center text-lg font-bold text-amber-400 animate-bounce">
          🎉 Tier Up!
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xl font-semibold">{label}</p>
          <p className="text-sm text-gray-400 mt-1">
            {hazard === 'NONE' ? 'No hazard detected — no points awarded.' : 'Hazard verified by AI.'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-400">
            {earnedPts > 0 ? `+${earnedPts}` : '±0'} pts
          </p>
          <MedalBadge tier={user.medalTier} size="sm" />
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t border-gray-800 pt-3">
        Total: <span className="text-white font-medium">{user.points.toLocaleString()} pts</span>
        &ensp;·&ensp;
        Progress: <span className="text-white font-medium">{user.progressPercentage.toFixed(1)}%</span>
        {' '}to {user.nextTierThreshold.toLocaleString()}
      </div>
    </div>
  )
}
