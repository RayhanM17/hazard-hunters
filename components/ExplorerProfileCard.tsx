'use client'

import { motion } from 'framer-motion'
import { Map as MapIcon, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getExplorerTitleMeta, nextTitleProgress } from '@/lib/explorer'
import type { User } from '@/types'

interface Props {
  user: Pick<User, 'cellsExplored' | 'zonesExplored' | 'explorationStreak' | 'explorerTitle' | 'explorerRank' | 'streakStatus'>
}

export default function ExplorerProfileCard({ user }: Props) {
  const meta = getExplorerTitleMeta(user.explorerTitle)
  const Icon = meta.icon
  const { nextThreshold, percentage } = nextTitleProgress(user.cellsExplored)
  const clamped = Math.min(100, Math.max(0, percentage))

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border bg-slate-800/90 px-3.5 py-1.5 text-sm font-semibold"
            style={{ color: meta.color, borderColor: `${meta.color}66` }}
          >
            <Icon size={16} strokeWidth={2.5} />
            {user.explorerTitle}
          </span>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {typeof user.explorerRank === 'number' && (
              <span className="font-medium text-slate-300">#{user.explorerRank} Explorer</span>
            )}
            {user.streakStatus && (
              <span className="flex items-center gap-1 font-medium text-amber-400">
                <Flame size={13} /> {user.streakStatus}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapIcon size={14} />
              {user.cellsExplored.toLocaleString()} cells · {user.zonesExplored.toLocaleString()} zones explored
            </span>
            {nextThreshold !== null ? (
              <span className="tabular-nums">{nextThreshold - user.cellsExplored} cells to next title</span>
            ) : (
              <span className="font-medium text-amber-400">Top title reached</span>
            )}
          </div>

          <Progress value={clamped} className="h-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
              initial={false}
              animate={{ width: `${clamped}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </Progress>
        </div>
      </CardContent>
    </Card>
  )
}
