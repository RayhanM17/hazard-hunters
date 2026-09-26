'use client'

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { getTier } from '@/lib/medals'
import { Progress } from '@/components/ui/progress'
import type { MedalTier } from '@/types'

interface Props {
  percentage: number
  nextThreshold: number
  tier: MedalTier
}

export default function ProgressBar({ percentage, nextThreshold, tier }: Props) {
  const meta = getTier(tier)
  const isMax = tier === 'Apex Driver'
  const clamped = Math.min(100, Math.max(0, percentage))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span className="font-medium text-slate-200">{tier}</span>
        {isMax ? (
          <span className="flex items-center gap-1 font-medium text-amber-400">
            <Crown size={14} /> Max tier reached
          </span>
        ) : (
          <span className="tabular-nums">{nextThreshold.toLocaleString()} pts to next tier</span>
        )}
      </div>

      <Progress value={clamped} className="relative">
        <motion.div
          className={`h-full rounded-full ${meta.gradient} ${meta.glow ?? ''}`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </Progress>

      <p className="text-right text-xs tabular-nums text-slate-500">{clamped.toFixed(1)}%</p>
    </div>
  )
}
