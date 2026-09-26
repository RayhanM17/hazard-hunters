import { Trophy, Medal, Award } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import { cn } from '@/lib/utils'
import MedalBadge from './MedalBadge'

interface Props {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  podium?: boolean
}

const PODIUM_STYLES: Record<number, string> = {
  1: 'bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950',
  2: 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950',
  3: 'bg-gradient-to-r from-orange-300 to-amber-600 text-slate-950',
}

const RANK_ICONS: Record<number, typeof Trophy> = { 1: Trophy, 2: Medal, 3: Award }

export default function LeaderboardRow({ entry, isCurrentUser, podium }: Props) {
  const podiumStyle = podium ? PODIUM_STYLES[entry.rank] ?? '' : ''
  const RankIcon = podium ? RANK_ICONS[entry.rank] : undefined

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3',
        podiumStyle || 'border border-slate-800 bg-slate-900',
        isCurrentUser && !podium && 'ring-2 ring-indigo-500',
      )}
    >
      <span className="flex w-8 shrink-0 items-center justify-center font-display text-sm font-bold">
        {RankIcon ? <RankIcon size={18} /> : `#${entry.rank}`}
      </span>

      <span className="flex-1 truncate font-medium">
        {entry.username}
        {isCurrentUser && <span className="ml-2 text-xs text-indigo-400">(you)</span>}
      </span>

      <MedalBadge tier={entry.medalTier} size="sm" />

      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {entry.points.toLocaleString()}
      </span>
    </div>
  )
}
