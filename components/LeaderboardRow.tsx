import type { LeaderboardEntry } from '@/types'
import MedalBadge from './MedalBadge'

interface Props {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  podium?: boolean
}

const PODIUM_STYLES: Record<number, string> = {
  1: 'bg-gradient-to-r from-yellow-300 to-amber-500 text-gray-900',
  2: 'bg-gradient-to-r from-slate-200 to-slate-400 text-gray-900',
  3: 'bg-gradient-to-r from-orange-300 to-amber-700 text-gray-900',
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LeaderboardRow({ entry, isCurrentUser, podium }: Props) {
  const podiumStyle = podium ? PODIUM_STYLES[entry.rank] ?? '' : ''
  const highlightStyle = isCurrentUser && !podium ? 'ring-1 ring-sky-500' : ''

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-4 py-3 ${podiumStyle || 'bg-gray-900'} ${highlightStyle}`}
    >
      {/* Rank */}
      <span className="w-8 text-center font-bold text-sm shrink-0">
        {RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}
      </span>

      {/* Username */}
      <span className="flex-1 font-medium truncate">
        {entry.username}
        {isCurrentUser && <span className="ml-2 text-xs text-sky-400">(you)</span>}
      </span>

      {/* Medal badge */}
      <MedalBadge tier={entry.medalTier} size="sm" />

      {/* Points */}
      <span className="text-sm font-semibold tabular-nums shrink-0">
        {entry.points.toLocaleString()}
      </span>
    </div>
  )
}
