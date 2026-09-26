import { Trophy, Medal, Award } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import { cn } from '@/lib/utils'
import { getExplorerTitleMeta } from '@/lib/explorer'
import MedalBadge from './MedalBadge'

interface Props {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  podium?: boolean
  /** 'points' (default) shows medal tier + points; 'explorer' shows explorer title + cells explored. */
  mode?: 'points' | 'explorer'
}

const PODIUM_STYLES: Record<number, string> = {
  1: 'bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950',
  2: 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950',
  3: 'bg-gradient-to-r from-orange-300 to-amber-600 text-slate-950',
}

const RANK_ICONS: Record<number, typeof Trophy> = { 1: Trophy, 2: Medal, 3: Award }

export default function LeaderboardRow({ entry, isCurrentUser, podium, mode = 'points' }: Props) {
  const podiumStyle = podium ? PODIUM_STYLES[entry.rank] ?? '' : ''
  const RankIcon = podium ? RANK_ICONS[entry.rank] : undefined
  const explorerMeta = mode === 'explorer' ? getExplorerTitleMeta(entry.explorerTitle) : null
  const ExplorerIcon = explorerMeta?.icon

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

      {mode === 'explorer' && explorerMeta && ExplorerIcon ? (
        <span
          className="inline-flex items-center gap-1 rounded-full border bg-slate-800/90 px-2.5 py-1 text-xs font-semibold"
          style={{ color: explorerMeta.color, borderColor: `${explorerMeta.color}66` }}
        >
          <ExplorerIcon size={14} strokeWidth={2.5} />
          {entry.explorerTitle}
        </span>
      ) : (
        <MedalBadge tier={entry.medalTier} size="sm" />
      )}

      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {mode === 'explorer'
          ? `${entry.cellsExplored.toLocaleString()} cells`
          : entry.points.toLocaleString()}
      </span>
    </div>
  )
}
