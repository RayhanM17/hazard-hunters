'use client'

import { useMemo, useState } from 'react'
import { Trophy, Map as MapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TIER_ORDER, getTier } from '@/lib/medals'
import { EXPLORER_TITLE_ORDER } from '@/lib/explorer'
import LeaderboardRow from './LeaderboardRow'
import type { LeaderboardEntry, MedalTier } from '@/types'

interface Props {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

type Sort = 'points' | 'explorer'

const TABS: { key: Sort; label: string; icon: typeof Trophy }[] = [
  { key: 'points', label: 'Points', icon: Trophy },
  { key: 'explorer', label: 'Explorer', icon: MapIcon },
]

export default function LeaderboardTabs({ entries, currentUserId }: Props) {
  const [sort, setSort] = useState<Sort>('points')

  const sorted = useMemo(() => {
    if (sort === 'points') return entries
    return [...entries].sort((a, b) => b.cellsExplored - a.cellsExplored)
  }, [entries, sort])

  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  const order: Record<string, number> = sort === 'points' ? TIER_ORDER : EXPLORER_TITLE_ORDER

  const grouped = rest.reduce<Record<string, LeaderboardEntry[]>>((acc, e) => {
    const key = sort === 'points' ? e.medalTier : e.explorerTitle
    acc[key] ??= []
    acc[key].push(e)
    return acc
  }, {})

  const groups = Object.entries(grouped).sort(([a], [b]) => order[a] - order[b])

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-slate-800 bg-slate-900 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              sort === key
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-100',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {top3.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            isCurrentUser={entry.userId === currentUserId}
            mode={sort}
            podium
          />
        ))}
      </div>

      {groups.map(([groupName, groupEntries]) => {
        const meta = sort === 'points' ? getTier(groupName as MedalTier) : null
        const Icon = meta?.icon
        return (
          <section key={groupName}>
            <h2 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">
              {Icon && <Icon size={14} />}
              {groupName}
            </h2>
            <div className="space-y-1">
              {groupEntries.map((entry) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={entry.userId === currentUserId}
                  mode={sort}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
